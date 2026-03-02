import { useEffect, useState } from 'react';
import { ModeSelect } from './components/ModeSelect';
import { IntroWizard } from './components/IntroWizard';
import { Session } from './components/Session';
import { SessionsList } from './components/SessionsList';
import { SessionDetail } from './components/SessionDetail';
import { CardsSandbox } from './components/CardsSandbox';
import { OverlayPreview } from './components/OverlayPreview';
import { DebugSession } from './components/DebugSession';
import type { SessionReport } from './types';
export type Mode = 'pitch_perfect' | 'empathy_trainer' | 'veritalk' | 'impromptu' | 'professional_introduction';

// ─── Hash Router ──────────────────────────────────────────────────────────────

export type Route =
    | { name: 'home' }
    | { name: 'session'; mode: Mode; context?: { organization: string; role: string } }
    | { name: 'sessions' }
    | { name: 'session-detail'; id: string; shareKey?: string }
    | { name: 'cards-sandbox' }
    | { name: 'overlay-preview' }
    | { name: 'debug-session' };

function parseHash(): Route {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash === 'sessions') return { name: 'sessions' };
    if (hash === 'debug-session') return { name: 'debug-session' };
    if (hash === 'cards_sandbox') return { name: 'cards-sandbox' };
    if (hash === '_preview') return { name: 'overlay-preview' };
    // Match #/sessions/:id/:key  (shareable)  or  #/sessions/:id  (owner)
    const shareMatch = hash.match(/^sessions\/([^/]+)\/([^/]+)$/);
    if (shareMatch) return { name: 'session-detail', id: shareMatch[1], shareKey: shareMatch[2] };
    const detailMatch = hash.match(/^sessions\/([^/]+)$/);
    if (detailMatch) return { name: 'session-detail', id: detailMatch[1] };
    return { name: 'home' };
}

export function navigateTo(path: string) {
    window.location.hash = path;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
    const [route, setRoute] = useState<Route>(parseHash());
    const [showWizardFor, setShowWizardFor] = useState<Mode | null>(null);
    // Read userId synchronously so it's available on the very first render
    const [userId] = useState<string>(() => {
        let id = localStorage.getItem('debatepro_user_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('debatepro_user_id', id);
        }
        return id;
    });

    useEffect(() => {
        const onHash = () => setRoute(parseHash());
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);

    const handleStart = (selectedMode: Mode) => {
        if (selectedMode === 'professional_introduction') {
            setShowWizardFor(selectedMode);
        } else {
            setRoute({ name: 'session', mode: selectedMode });
        }
    };

    const handleWizardStart = (context: { organization: string; role: string }) => {
        setRoute({ name: 'session', mode: showWizardFor!, context });
        setShowWizardFor(null);
    };

    const handleWizardCancel = () => {
        setShowWizardFor(null);
    };

    const handleSessionEnd = (reportData: SessionReport) => {
        navigateTo(`sessions/${reportData.session_id}`);
    };

    const handleRestart = () => {
        window.location.hash = '';
        setRoute({ name: 'home' });
    };

    return (
        <div className="app">
            {route.name === 'home' && <ModeSelect onStart={handleStart} userId={userId} />}
            {showWizardFor === 'professional_introduction' && (
                <IntroWizard
                    userId={userId}
                    onStart={handleWizardStart}
                    onCancel={handleWizardCancel}
                />
            )}
            {route.name === 'session' && (
                <Session mode={route.mode} context={route.context} onEnd={handleSessionEnd} userId={userId} />
            )}
            {route.name === 'sessions' && <SessionsList userId={userId} />}
            {route.name === 'session-detail' && (
                <SessionDetail
                    sessionId={route.id}
                    userId={userId}
                    shareKey={route.shareKey}
                    onRestart={handleRestart}
                />
            )}
            {route.name === 'cards-sandbox' && <CardsSandbox />}
            {route.name === 'overlay-preview' && <OverlayPreview />}
            {route.name === 'debug-session' && <DebugSession />}
        </div>
    );
}
