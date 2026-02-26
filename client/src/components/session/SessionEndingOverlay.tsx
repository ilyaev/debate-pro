import { SessionTopbar } from './SessionTopbar';

interface Props {
    mode: string;
    elapsed: number;
}

export function SessionEndingOverlay({ mode, elapsed }: Props) {
    return (
        <div className="session session--ending">
            <SessionTopbar mode={mode} elapsed={elapsed} />

            <div className="session__loading">
                <div className="session__loading-spinner" />
                <h2 className="session__loading-title">Analyzing your session</h2>
                <p className="session__loading-subtitle">
                    Generating your personalized performance report...
                </p>
                <div className="session__loading-steps">
                    <span className="session__loading-step session__loading-step--done">
                        ✓ Session recorded
                    </span>
                    <span className="session__loading-step session__loading-step--active">
                        ⟳ Analyzing transcript &amp; metrics
                    </span>
                    <span className="session__loading-step">
                        ○ Building report
                    </span>
                </div>
            </div>
        </div>
    );
}
