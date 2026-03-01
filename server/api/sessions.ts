import { Router } from 'express';
import { z } from 'zod';
import type { SessionStore } from '../store.js';
import { normalizeDate } from '../utils/dates.js';
import { sessionAuth, requireReport } from '../middleware/session-auth.js';
import { buildOgHtml } from '../services/og-html.js';
import { renderOgImage, areFontsLoaded, loadAssets } from '../services/og-renderer.js';

// Load OG renderer assets at module init
loadAssets();

// ─── Validation Schemas ───────────────────────────────────────────────────────
const userIdQuery = z.object({ userId: z.string().min(1) });
const shareKeyParam = z.object({
    id: z.string().min(1),
    key: z.string().length(24),
});
const presetSchema = z.object({
    userId: z.string().min(1),
    presetName: z.string().min(1),
    organization: z.string(),
    role: z.string(),
    background: z.string().optional(),
});

// ─── Router Factory (dependency injection) ────────────────────────────────────
export function createSessionsRouter(store: SessionStore): Router {
    const router = Router();
    const auth = sessionAuth(store);

    // GET /api/sessions?userId=<id> — list session summaries for a user
    router.get('/', async (req, res) => {
        const parsed = userIdQuery.safeParse(req.query);
        if (!parsed.success) {
            res.status(400).json({ error: 'userId query param is required' });
            return;
        }
        try {
            const sessions = await store.listByUser(parsed.data.userId);
            res.json(sessions.map(s => ({
                ...s,
                startedAt: normalizeDate(s.startedAt),
            })));
        } catch (err) {
            console.error('GET /api/sessions error:', err);
            res.status(500).json({ error: 'Failed to list sessions' });
        }
    });

    // --- Profiles & Presets ---

    // GET /api/sessions/profile?userId=<id>
    router.get('/profile', async (req, res) => {
        const parsed = userIdQuery.safeParse(req.query);
        if (!parsed.success) {
            res.status(400).json({ error: 'userId query param is required' });
            return;
        }
        try {
            const profile = await store.getProfile(parsed.data.userId);
            res.json(profile || { factualSummary: '', coachingNotes: '' });
        } catch (err) {
            console.error('GET /api/sessions/profile error:', err);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    });

    // GET /api/sessions/presets?userId=<id>
    router.get('/presets', async (req, res) => {
        const parsed = userIdQuery.safeParse(req.query);
        if (!parsed.success) {
            res.status(400).json({ error: 'userId query param is required' });
            return;
        }
        try {
            const presets = await store.listPresets(parsed.data.userId);
            res.json(presets);
        } catch (err) {
            console.error('GET /api/sessions/presets error:', err);
            res.status(500).json({ error: 'Failed to list presets' });
        }
    });

    // POST /api/sessions/presets
    router.post('/presets', async (req, res) => {
        const parsed = presetSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: 'Invalid preset data', details: parsed.error });
            return;
        }
        try {
            const preset = await store.savePreset({
                ...parsed.data,
                lastUsedAt: new Date(),
            });
            res.json(preset);
        } catch (err) {
            console.error('POST /api/sessions/presets error:', err);
            res.status(500).json({ error: 'Failed to save preset' });
        }
    });

    // GET /api/sessions/:id — full session with transcript and report
    // Access via: ?userId=<id> (owner) OR ?key=<shareKey> (shared link)
    router.get('/:id', auth, async (req, res) => {
        const session = req.sessionData!;
        const accessLevel = req.accessLevel!;

        const sanitizedSession = accessLevel !== 'owner' ? {
            id: session.id,
            mode: session.mode,
            startedAt: normalizeDate(session.startedAt),
            report: session.report,
            metrics: session.metrics,
            voiceName: session.voiceName,
            ...(accessLevel === 'full_share' ? { transcript: session.transcript } : {}),
        } : {
            ...session,
            startedAt: normalizeDate(session.startedAt),
        };

        res.json(sanitizedSession);
    });

    // GET /api/sessions/shared/og/:id/:key — OG meta tags HTML for social preview
    router.get('/shared/og/:id/:key', auth, requireReport, async (req, res) => {
        const session = req.sessionData!;
        const id = req.params.id as string;
        const key = req.params.key as string;

        try {
            const html = buildOgHtml({
                session,
                id,
                key,
                protocol: req.protocol,
                host: req.get('host')!,
            });

            const htmlBuffer = Buffer.from(html, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Content-Length', htmlBuffer.length);
            res.status(200).end(htmlBuffer);
        } catch (err) {
            console.error(`GET /api/shared/og/${id}/${key} error:`, err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // GET /api/sessions/shared/og-image/:id/:key — Render OG share image (PNG)
    router.get('/shared/og-image/:id/:key', auth, requireReport, async (req, res) => {
        const session = req.sessionData!;
        const id = req.params.id as string;
        const key = req.params.key as string;

        try {
            if (!areFontsLoaded()) {
                res.status(500).json({ error: 'Fonts not loaded server-side' });
                return;
            }

            const pngBuffer = await renderOgImage(session);

            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.send(pngBuffer);
        } catch (err) {
            console.error(`GET /api/shared/og-image/${id}/${key} error:`, err);
            res.status(500).json({ error: 'Failed to render OG image' });
        }
    });

    return router;
}

export default createSessionsRouter;
