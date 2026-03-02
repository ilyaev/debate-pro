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
import type { SessionReport, SessionStatus, MetricSnapshot, TranscriptCue } from '../types';

interface Props {
    mode: string;
    userId: string;
    context?: { organization: string; role: string };
    onEnd: (report: SessionReport) => void;
    debug?: boolean;
    debugStatus?: SessionStatus;
    debugMetrics?: MetricSnapshot | null;
    debugCues?: TranscriptCue[];
}

export function Session({ mode, userId, context, onEnd, debug, debugStatus, debugMetrics, debugCues }: Props) {
    const {
        celebration,
        handleReportReceived,
        handleCelebrationComplete,
        checkMilestones
    } = useCelebration({ userId, onEnd });

    const sessionLogic = useSessionLogic(mode, userId, handleReportReceived, context, {
        enabled: !debug
    });

    const status = debug && debugStatus ? debugStatus : sessionLogic.status;
    const metrics = debug && debugMetrics !== undefined ? debugMetrics : sessionLogic.metrics;
    const cues = debug && debugCues ? debugCues : sessionLogic.cues;
    const elapsed = sessionLogic.elapsed;
    const isConnected = debug ? true : sessionLogic.isConnected;
    // const isPaused = sessionLogic.isPaused;
    // const togglePause = sessionLogic.togglePause;
    const handleEnd = sessionLogic.handleEnd;
    const userAnalyserRef = sessionLogic.userAnalyserRef;
    const aiAnalyserRef = sessionLogic.aiAnalyserRef;
    const feedEndRef = sessionLogic.feedEndRef;

    const handleCancel = () => {
        if (!debug) {
            sessionLogic.handleEnd(); // Clean up WebSocket
        }
        window.location.hash = ''; // Return to home/cancel wizard
    };

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
            {status !== 'connecting' && <SessionTopbar mode={mode} elapsed={elapsed} status={status} />}
            <SessionStatusDisplay status={status} />

            {status !== 'connecting' && (
                <>
                    <Waveform
                        userAnalyserRef={userAnalyserRef}
                        aiAnalyserRef={aiAnalyserRef}
                        status={status}
                        mode={mode}
                    />

                    <Dashboard status={status} metrics={metrics} elapsed={elapsed} />
                    <TranscriptFeed status={status} cues={cues} feedEndRef={feedEndRef} />
                </>
            )}

            <div className="session__actions">
                <button
                    className={`session__btn ${status === 'connecting' ? 'session__btn--cancel' : 'session__btn--end'}`}
                    onClick={status === 'connecting' ? handleCancel : handleEnd}
                    disabled={!isConnected && status !== 'connecting'}
                >
                    {status === 'connecting' ? 'Cancel' : 'End Session'}
                </button>
            </div>
        </div>
    );
}
