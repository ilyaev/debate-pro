import { useEffect } from 'react';
import { useSessionLogic } from '../hooks/useSessionLogic';
import { useCelebration } from '../hooks/useCelebration';
import { Dashboard } from './Dashboard';
import { Waveform } from './Waveform';
import { SessionTopbar } from './session/SessionTopbar';
import { SessionEndingOverlay } from './session/SessionEndingOverlay';
import { CongratulationsOverlay } from './session/CongratulationsOverlay';
import { SessionStatusDisplay } from './session/SessionStatusDisplay';
import { TranscriptFeed } from './session/TranscriptFeed';
import type { SessionReport } from '../types';

interface Props {
    mode: string;
    userId: string;
    context?: { organization: string; role: string };
    onEnd: (report: SessionReport) => void;
}

export function Session({ mode, userId, context, onEnd }: Props) {
    const {
        celebration,
        handleReportReceived,
        handleCelebrationComplete,
        checkMilestones
    } = useCelebration({ userId, onEnd });

    const {
        status, metrics, cues, elapsed,
        isConnected, isPaused, togglePause, handleEnd,
        userAnalyserRef, aiAnalyserRef, feedEndRef,
    } = useSessionLogic(mode, userId, handleReportReceived, context);

    // Trigger milestone check when status changes to 'ending'
    useEffect(() => {
        checkMilestones(status);
    }, [status, checkMilestones]);

    // Show celebration overlay
    if (celebration) {
        return (
            <CongratulationsOverlay
                mode={mode}
                variant={celebration}
                onComplete={handleCelebrationComplete}
            />
        );
    }

    if (status === 'ending') {
        return <SessionEndingOverlay mode={mode} elapsed={elapsed} />;
    }

    return (
        <div className="session">
            <SessionTopbar mode={mode} elapsed={elapsed} />
            <SessionStatusDisplay status={status} />

            <Waveform
                userAnalyserRef={userAnalyserRef}
                aiAnalyserRef={aiAnalyserRef}
                status={status}
                mode={mode}
            />

            <Dashboard metrics={metrics} elapsed={elapsed} />
            <TranscriptFeed cues={cues} feedEndRef={feedEndRef} />

            <div className="session__actions">
                {/* <button
                    className="session__btn session__btn--pause"
                    onClick={togglePause}
                    disabled={!isConnected || status === 'connecting'}
                >
                    {isPaused ? 'Resume Session' : 'Pause Session'}
                </button> */}
                <button
                    className="session__btn session__btn--end"
                    onClick={handleEnd}
                    disabled={!isConnected || status === 'connecting'}
                >
                    End Session
                </button>
            </div>
        </div>
    );
}
