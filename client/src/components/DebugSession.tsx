import { useState } from 'react';
import { Session } from './Session';
import type { SessionStatus, MetricSnapshot, TranscriptCue } from '../types';

export function DebugSession() {
    const [status, setStatus] = useState<SessionStatus>('connecting');
    const [metrics, setMetrics] = useState<MetricSnapshot | null>(null);
    const [cues, setCues] = useState<TranscriptCue[]>([]);

    const MOCK_METRICS: MetricSnapshot = {
        words_per_minute: 150,
        filler_words: { um: 1, uh: 2 },
        talk_ratio: 55,
        clarity_score: 85,
        tone: 'Confident',
        key_phrases: ['Great start', 'Good morning'],
        improvement_hint: 'Great pacing. Try reducing fillers.'
    };

    const handleInjectMetrics = () => setMetrics(MOCK_METRICS);
    const handleClearMetrics = () => setMetrics(null);

    const handleAddCue = () => {
        setCues(prev => [
            ...prev,
            { text: `Mock transcript message ${prev.length + 1}...`, timestamp: Date.now() }
        ]);
    };

    const handleClearCues = () => setCues([]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100dvh' }}>
            {/* Control Panel Floating Above */}
            <div style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '16px',
                borderRadius: '8px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                maxWidth: '300px'
            }}>
                <h4 style={{ margin: 0, borderBottom: '1px solid #444', paddingBottom: '4px' }}>Debug Panel</h4>

                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Status:
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value as SessionStatus)}
                        style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '2px 4px' }}
                    >
                        <option value="connecting">Connecting (Loading)</option>
                        <option value="listening">Listening</option>
                        <option value="speaking">Speaking</option>
                        <option value="interrupted">Interrupted</option>
                        <option value="paused">Paused</option>
                        <option value="disconnected">Disconnected</option>
                        <option value="ending">Ending</option>
                    </select>
                </label>

                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <button onClick={handleInjectMetrics} style={{ flex: 1, cursor: 'pointer' }}>Set Metrics</button>
                    <button onClick={handleClearMetrics} style={{ flex: 1, cursor: 'pointer' }}>Clear Metrics</button>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={handleAddCue} style={{ flex: 1, cursor: 'pointer' }}>Add Cue</button>
                    <button onClick={handleClearCues} style={{ flex: 1, cursor: 'pointer' }}>Clear Cues</button>
                </div>
            </div>

            {/* The Real Session Component with debug enabled */}
            <Session
                mode="debug"
                userId="debug-local-user"
                onEnd={() => console.log('Session Ended from Debug')}
                debug={true}
                debugStatus={status}
                debugMetrics={metrics}
                debugCues={cues}
            />
        </div>
    );
}
