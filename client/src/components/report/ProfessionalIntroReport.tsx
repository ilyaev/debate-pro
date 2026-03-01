import type { SessionReport } from '../../types';
import {
    ScoreGauge, CategoryCards, MetricsStrip,
    KeyMoments, ImprovementTips, ReportActions, Transcript,
    PartnerInfo, PartnerInsightCard
} from './ReportBase';

interface Props {
    data: SessionReport;
    onRestart: () => void;
    transcript?: string[];
    sessionId?: string;
    userId?: string;
    isShared?: boolean;
}

export function ProfessionalIntroReport({ data, onRestart, transcript, sessionId, userId, isShared }: Props) {
    // Custom Extra Fields based on config.ts:
    // - strongest_asset (string)
    // - missed_opportunities (string[])
    // - overall_verdict (string)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extra = (data.extra || data.extraFields || {}) as any;

    return (
        <div className="report">
            <h1 className="report__title">Interview Introduction</h1>
            <PartnerInfo voiceName={data.voiceName} roleHint="Virtual Interviewer" />
            <ScoreGauge score={data.overall_score} />
            <PartnerInsightCard sessionId={sessionId} userId={userId} voiceName={data.voiceName} />

            <div className="report__grid-row">
                {extra.strongest_asset && (
                    <div className="report__extra-card report__extra-card--success report__extra-card--half">
                        <div className="report__extra-card-header"><h3>Strongest Asset</h3></div>
                        <div className="report__extra-card-body"><p>{extra.strongest_asset}</p></div>
                    </div>
                )}
                {extra.overall_verdict && (
                    <div className="report__extra-card report__extra-card--info report__extra-card--half">
                        <div className="report__extra-card-header"><h3>Overall Verdict</h3></div>
                        <div className="report__extra-card-body"><p>{extra.overall_verdict}</p></div>
                    </div>
                )}
            </div>

            <CategoryCards categories={data.categories} />
            <MetricsStrip metrics={data.metrics} displayMetrics={data.displayMetrics} />

            {extra.missed_opportunities && extra.missed_opportunities.length > 0 && (
                <div className="report__extra-card report__extra-card--warning">
                    <div className="report__extra-card-header">
                        <h3>Missed Opportunities</h3>
                        <span className="report__extra-badge">{extra.missed_opportunities.length}</span>
                    </div>
                    <div className="report__extra-card-body">
                        <ul className="report__missed-list">
                            {extra.missed_opportunities.map((opp: string, i: number) => (
                                <li key={i}>{opp}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <KeyMoments moments={data.key_moments} />
            <ImprovementTips tips={data.improvement_tips} />
            <Transcript lines={transcript} aiName={data.voiceName} />
            <ReportActions onRestart={onRestart} sessionId={sessionId} userId={userId} isShared={isShared} report={data} />
        </div>
    );
}
