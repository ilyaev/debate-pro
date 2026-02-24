import { Router } from 'express';
import { createStore } from '../store.js';
import { createHash } from 'crypto';

const router = Router();
const store = createStore();

// GET /api/sessions?userId=<id> — list summary for a user
router.get('/', async (req, res) => {
    const userId = req.query.userId as string | undefined;
    if (!userId) {
        res.status(400).json({ error: 'userId query param is required' });
        return;
    }
    try {
        const sessions = await store.listByUser(userId);
        res.json(sessions.map(s => ({
            ...s,
            startedAt: s.startedAt instanceof Date ? s.startedAt.toISOString() : s.startedAt,
        })));
    } catch (err) {
        console.error('GET /api/sessions error:', err);
        res.status(500).json({ error: 'Failed to list sessions' });
    }
});

// GET /api/sessions/:id — full session with transcript and report
// Access via: ?userId=<id> (owner) OR ?key=<shareKey> (shared link)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId as string | undefined;
    const shareKey = req.query.key as string | undefined;

    try {
        const session = await store.get(id);
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        // If a share key is provided, verify SHA-256(sessionId + userId)
        if (shareKey) {
            const expected = createHash('sha256')
                .update(session.id + session.userId)
                .digest('hex')
                .slice(0, 24);
            if (shareKey !== expected) {
                res.status(403).json({ error: 'Invalid share key' });
                return;
            }
            // Key matched — serve the session
        } else if (userId && session.userId !== userId) {
            // No share key — regular ownership check
            res.status(403).json({ error: 'Forbidden' });
            return;
        } else if (!userId) {
            res.status(403).json({ error: 'userId or key required' });
            return;
        }

        res.json({
            ...session,
            startedAt: session.startedAt instanceof Date ? session.startedAt.toISOString() : session.startedAt,
        });
    } catch (err) {
        console.error(`GET /api/sessions/${id} error:`, err);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

export default router;
