import type { Request, Response, NextFunction } from 'express';
import type { SessionStore, SessionData } from '../store.js';
import { validateShareKey, type ShareAccess } from '../utils/share-key.js';

export type AccessLevel = 'owner' | 'basic_share' | 'full_share';

// Extend Express Request to carry session + access info
declare global {
    namespace Express {
        interface Request {
            sessionData?: SessionData;
            accessLevel?: AccessLevel;
        }
    }
}

/**
 * Middleware factory that loads a session and verifies access.
 * Supports two auth patterns:
 *   - Owner: ?userId=<id>
 *   - Share key: ?key=<key> or route param :key
 */
export function sessionAuth(store: SessionStore) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;
        if (!id) {
            res.status(400).json({ error: 'Session ID is required' });
            return;
        }

        try {
            const session = await store.get(id);
            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }

            // Share key from query (?key=...) or route param (:key)
            const shareKey = (req.query.key as string | undefined) || (req.params.key as string | undefined);
            const userId = req.query.userId as string | undefined;

            if (shareKey) {
                const access = validateShareKey(session, shareKey);
                if (!access) {
                    res.status(403).json({ error: 'Invalid share key' });
                    return;
                }
                req.sessionData = session;
                req.accessLevel = access === 'full' ? 'full_share' : 'basic_share';
            } else if (userId) {
                if (session.userId !== userId) {
                    res.status(403).json({ error: 'Forbidden' });
                    return;
                }
                req.sessionData = session;
                req.accessLevel = 'owner';
            } else {
                res.status(403).json({ error: 'userId or key required' });
                return;
            }

            next();
        } catch (err) {
            console.error(`Session auth error for ${id}:`, err);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

/**
 * Middleware that requires the session to have a report.
 * Must be used after sessionAuth.
 */
export function requireReport(req: Request, res: Response, next: NextFunction) {
    if (!req.sessionData?.report) {
        res.status(404).json({ error: 'Session report not found' });
        return;
    }
    next();
}
