import { useState } from 'react';
import { ModeSelect } from './components/ModeSelect';
import { Session } from './components/Session';
import { Report } from './components/Report';
import type { SessionReport } from './types';

export type Screen = 'select' | 'session' | 'report';
export type Mode = 'pitch_perfect' | 'empathy_trainer' | 'veritalk';

export default function App() {
    const [screen, setScreen] = useState<Screen>('select');
    const [mode, setMode] = useState<Mode>('pitch_perfect');
    const [report, setReport] = useState<SessionReport | null>(null);

    const handleStart = (selectedMode: Mode) => {
        setMode(selectedMode);
        setScreen('session');
    };

    const handleSessionEnd = (reportData: SessionReport) => {
        setReport(reportData);
        setScreen('report');
    };

    return (
        <div className="app">
            {screen === 'select' && <ModeSelect onStart={handleStart} />}
            {screen === 'session' && (
                <Session mode={mode} onEnd={handleSessionEnd} />
            )}
            {screen === 'report' && report && (
                <Report data={report} onRestart={() => setScreen('select')} />
            )}
        </div>
    );
}
