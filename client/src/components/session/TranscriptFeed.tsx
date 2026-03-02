import type { TranscriptCue } from '../../types';
import { formatTime } from '../../config';
import { STATUS_TEXT } from './SessionStatusDisplay';

interface Props {
    status: import('../../types').SessionStatus;
    cues: TranscriptCue[];
    feedEndRef: React.RefObject<HTMLDivElement | null>;
}

export function TranscriptFeed({ status, cues, feedEndRef }: Props) {
    return (
        <div className={`transcript-feed ${status === 'connecting' ? 'skeleton-dim' : ''}`}>
            <div className="transcript-feed__header">
                <h3 className="transcript-feed__title">
                    <span className="transcript-feed__live-dot" />
                    Live Transcript
                </h3>
                {status !== 'connecting' && (
                    <span className="transcript-feed__status">
                        {STATUS_TEXT[status]}
                    </span>
                )}
            </div>
            <div className="transcript-feed__list">
                {cues.length === 0 ? (
                    <div className="transcript-feed__empty">
                        Waiting for conversation...
                    </div>
                ) : (
                    cues.map((cue, i) => (
                        <div
                            key={i}
                            className={`transcript-feed__item ${i === cues.length - 1 ? 'transcript-feed__item--latest' : ''}`}
                        >
                            <span className="transcript-feed__time">{formatTime(cue.timestamp)}</span>
                            <span className="transcript-feed__text">{cue.text}</span>
                        </div>
                    ))
                )}
                <div ref={feedEndRef} />
            </div>
        </div>
    );
}
