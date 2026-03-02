import { useState, useEffect } from 'react';
import type { SessionStatus } from '../../types';

export const STATUS_TEXT: Record<SessionStatus, string> = {
    "": "",
    connecting: 'Connecting...',
    listening: "I'm listening...",
    speaking: 'AI speaking...',
    interrupted: 'Interrupted!',
    ending: '',
    disconnected: 'AI disconnected — click End Session for your report',
    paused: 'Session Paused',
};

const CONNECTING_MESSAGES = [
    "Connecting to AI agent...",
    "Checking your microphone...",
    "Tuning the virtual environment...",
    "Warming up the vocal cords...",
    "Preparing your personalized session...",
    "Synthesizing persona...",
];

interface Props {
    status: SessionStatus;
}

export function SessionStatusDisplay({ status }: Props) {
    const [msgIndex, setMsgIndex] = useState(0);
    useEffect(() => {
        if (status !== 'connecting') return;
        const interval = setInterval(() => {
            setMsgIndex(current => (current + 1) % CONNECTING_MESSAGES.length);
        }, 3000); // match the animation duration
        return () => clearInterval(interval);
    }, [status]);

    if (status === 'connecting') {
        return (
            <div className={`session__status session__status--${status} connection-fullscreen`}>
                <div className="connecting-wrapper">
                    <div className="connecting-animation">
                        <div className="core-glow"></div>
                        <div className="core-glow-inner"></div>
                        <div className="ring ring-1"></div>
                        <div className="ring ring-2"></div>
                        <div className="ring ring-3"></div>
                        <div className="ring ring-4"></div>
                    </div>
                    <div className="connecting-text-carousel">
                        <span key={msgIndex} className="session__status-text fade-in-out-text">
                            {CONNECTING_MESSAGES[msgIndex]}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
