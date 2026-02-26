import { createHash } from 'crypto';
import type { SessionData } from '../store.js';

export interface ShareKeys {
    basic: string;
    full: string;
}

export type ShareAccess = 'basic' | 'full' | null;

export function computeShareKeys(sessionId: string, userId: string): ShareKeys {
    const basic = createHash('sha256')
        .update(sessionId + userId)
        .digest('hex')
        .slice(0, 24);

    const full = createHash('sha256')
        .update(sessionId + userId + 'full_transcript')
        .digest('hex')
        .slice(0, 24);

    return { basic, full };
}

export function validateShareKey(session: SessionData, key: string): ShareAccess {
    const { basic, full } = computeShareKeys(session.id, session.userId);
    if (key === full) return 'full';
    if (key === basic) return 'basic';
    return null;
}
