import { useState, useRef, useCallback, useEffect } from 'react';
import type { SessionReport } from '../types';
import type { CelebrationVariant } from '../components/session/CongratulationsOverlay';

const MILESTONE_THRESHOLDS = [5, 10, 25, 50, 100];
const HIGH_SCORE_THRESHOLD = 8;
const STORAGE_KEY_FIRST_SESSION = 'glotti_first_session_celebrated';

interface UseCelebrationProps {
    userId: string;
    onEnd: (report: SessionReport) => void;
}

interface UseCelebrationReturn {
    celebration: CelebrationVariant | null;
    handleReportReceived: (report: SessionReport) => void;
    handleCelebrationComplete: () => void;
    checkMilestones: (status: string) => void;
}

export function useCelebration({ userId, onEnd }: UseCelebrationProps): UseCelebrationReturn {
    const [celebration, setCelebration] = useState<CelebrationVariant | null>(null);
    const pendingReportRef = useRef<SessionReport | null>(null);
    const celebrationCheckedRef = useRef(false);

    // Wrap onEnd to intercept report for high-score check
    const handleReportReceived = useCallback((report: SessionReport) => {
        // If already celebrating (first_session/milestone), stash the report
        if (celebration) {
            pendingReportRef.current = report;
            return;
        }
        // Check for high score celebration (score is 1–10)
        if (report.overall_score >= HIGH_SCORE_THRESHOLD) {
            setCelebration({ kind: 'high_score', score: report.overall_score });
            pendingReportRef.current = report;
            return;
        }
        onEnd(report);
    }, [celebration, onEnd]);

    // Check for milestones when status changes
    const checkMilestones = useCallback((status: string) => {
        if (status !== 'ending' || celebrationCheckedRef.current) return;
        celebrationCheckedRef.current = true;

        // First session check
        const celebrated = localStorage.getItem(STORAGE_KEY_FIRST_SESSION);
        if (!celebrated) {
            setCelebration({ kind: 'first_session' });
            localStorage.setItem(STORAGE_KEY_FIRST_SESSION, 'true');
            return;
        }

        // Milestone check — fetch session count
        const apiBase = import.meta.env.VITE_API_URL ?? '';
        
        // Use an abort controller to cleanup fetch? 
        // We can't easily return cleanup from here since it's called inside useEffect usually.
        // But for simplicity let's just fire and forget, ignoring errors.
        
        fetch(`${apiBase}/api/sessions?userId=${encodeURIComponent(userId)}`)
            .then(r => r.ok ? r.json() : [])
            .then((data: unknown[]) => {
                // +1 because current session isn't saved yet
                const nextCount = data.length + 1;
                if (MILESTONE_THRESHOLDS.includes(nextCount)) {
                    setCelebration({ kind: 'milestone', count: nextCount });
                }
            })
            .catch(() => { 
                // silently ignore — no celebration on error 
            });
    }, [userId]);

    const handleCelebrationComplete = useCallback(() => {
        setCelebration(null);
        const pending = pendingReportRef.current;
        if (pending) {
            pendingReportRef.current = null;
            onEnd(pending);
        }
    }, [onEnd]);

    return {
        celebration,
        handleReportReceived,
        handleCelebrationComplete,
        checkMilestones
    };
}
