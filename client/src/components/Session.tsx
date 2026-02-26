import { useSessionLogic } from '../hooks/useSessionLogic';
import { Dashboard } from './Dashboard';
import { Waveform } from './Waveform';
import { SessionTopbar } from './session/SessionTopbar';
import { SessionEndingOverlay } from './session/SessionEndingOverlay';
import { SessionStatusDisplay } from './session/SessionStatusDisplay';
import { TranscriptFeed } from './session/TranscriptFeed';
import type { SessionReport } from '../types';

interface Props {
    mode: string;
    userId: string;
    onEnd: (report: SessionReport) => void;
}

export function Session({ mode, userId, onEnd }: Props) {
    const {
        status, metrics, cues, elapsed,
        isConnected, handleEnd,
        userAnalyserRef, aiAnalyserRef, feedEndRef,
    } = useSessionLogic(mode, userId, onEnd);

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

            <button
                className="session__end-btn"
                onClick={handleEnd}
                disabled={!isConnected || status === 'connecting'}
            >
                End Session
            </button>
        </div>
    );
}
