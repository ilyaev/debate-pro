import type { SessionStatus } from '../../types';

const STATUS_TEXT: Record<SessionStatus, string> = {
    connecting: 'Connecting...',
    listening: "I'm listening...",
    speaking: 'AI speaking...',
    interrupted: 'Interrupted!',
    ending: '',
    disconnected: 'AI disconnected — click End Session for your report',
    paused: 'Session Paused',
};

interface Props {
    status: SessionStatus;
}

export function SessionStatusDisplay({ status }: Props) {
    return (
        <div className={`session__status session__status--${status}`}>
            <span className="session__status-text">
                {STATUS_TEXT[status]}
            </span>
        </div>
    );
}
