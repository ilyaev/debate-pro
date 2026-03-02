import { Target, Handshake, Swords, Zap, Mic } from 'lucide-react';
import { MODE_CONFIG, formatTime, SESSION_WARNING_SECONDS } from '../../config';
import type { SessionStatus } from '../../types';
import { STATUS_TEXT } from './SessionStatusDisplay';

const MODE_ICONS: Record<string, React.ReactNode> = {
    pitch_perfect: <Target size={18} strokeWidth={2} />,
    empathy_trainer: <Handshake size={18} strokeWidth={2} />,
    veritalk: <Swords size={18} strokeWidth={2} />,
    impromptu: <Zap size={18} strokeWidth={2} />,
};

interface Props {
    mode: string;
    elapsed: number;
    status: SessionStatus;
}

export function SessionTopbar({ mode, elapsed, status }: Props) {
    const config = MODE_CONFIG[mode];
    const label = config?.label ?? mode;
    const iconUrl = config?.iconUrl;
    const fallbackIcon = MODE_ICONS[mode] ?? <Mic size={18} strokeWidth={2} />;

    return (
        <div className="session__topbar">
            <span className="session__mode-badge">
                <span className="session__mode-icon">
                    {iconUrl ? (
                        <img
                            src={iconUrl}
                            alt={label}
                            className="session__mode-image-icon"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.querySelector('.lucide-icon-fallback')!.removeAttribute('style');
                            }}
                        />
                    ) : null}
                    <span
                        className="lucide-icon-fallback"
                        style={iconUrl ? { display: 'none' } : {}}
                    >
                        {fallbackIcon}
                    </span>
                </span>
                {label}
            </span>
            <div className="session__topbar-status">
                <span className="session__status-text">{STATUS_TEXT[status]}</span>
            </div>
            <span className={`session__timer ${elapsed >= SESSION_WARNING_SECONDS ? 'session__timer--warning' : ''}`}>
                {formatTime(elapsed)}
            </span>
        </div>
    );
}
