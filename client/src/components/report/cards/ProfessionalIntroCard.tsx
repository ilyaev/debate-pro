import { forwardRef } from 'react';
import type { SessionReport } from '../../../types';
import { formatMetricValue } from '../ReportUtils.js';
import { Users, Clock, Target } from 'lucide-react';

interface CardProps {
    report: SessionReport;
    isOgImage?: boolean;
    ogBackgroundImage?: string;
}

export const ProfessionalIntroCard = forwardRef<HTMLDivElement, CardProps>(({ report, isOgImage, ogBackgroundImage }, ref) => {
    const { overall_score, metrics, extraFields, social_share_texts } = report;
    const metricsMap = metrics as unknown as Record<string, number | string>;
    const summaryText = social_share_texts?.performance_card_summary || 'A solid professional introduction.';

    // Fallback empty extra fields if not set
    const extra = extraFields || {};

    // Bottom left design style: Dynamic Orange/Teal gradient, bold banner, white cards
    return (
        <div
            ref={ref}
            className="performance-card-export"
            style={{
                width: '1080px',
                height: '1080px',
                background: isOgImage ? '#ffffff' : 'url(/cards/bg_interview.jpg) no-repeat center center',
                backgroundSize: 'cover',
                color: '#ffffff',
                fontFamily: 'Inter, system-ui, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxSizing: 'border-box',
                borderRadius: '40px',
                ...(isOgImage ? {} : { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }),
                overflow: 'hidden'
            }}
        >
            {/* Background Layer for Satori Data URI */}
            {isOgImage && ogBackgroundImage && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
                    <img
                        src={ogBackgroundImage}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                    {/* Dark gradient overlay removed for cleaner look, similar to PitchPerfectCard */}
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '60px 80px 80px 80px' }}>

                {/* Title */}
                <h1 style={{ display: 'flex', flexDirection: 'column', fontSize: '56px', fontWeight: '800', lineHeight: 1.1, margin: 0, textShadow: '0 4px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.8)' }}>
                    Interview Introduction
                </h1>

                {/* Centered White Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
                    <div style={{ display: 'flex', position: 'relative', width: '340px', height: '340px' }}>
                        <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}>
                            <circle cx="50%" cy="50%" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                            <circle
                                cx="50%" cy="50%" r="52"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${(overall_score / 10) * 327} 327`}
                                transform="rotate(-90 60 60)"
                            />
                        </svg>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '4%' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.4)', }}>
                                <span style={{ fontSize: '140px', fontWeight: '800' }}>{overall_score}</span>
                                <span style={{ fontSize: '40px', color: 'rgba(255,255,255,0.9)', marginLeft: '0px' }}> / 10</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bold Quote Banner */}
                <div style={{
                    width: '1080px',
                    padding: '24px 30px',
                    background: 'linear-gradient(to right, rgba(234, 88, 12, 0.90), rgba(194, 65, 12, 0.90))',
                    fontSize: '32px',
                    lineHeight: 1.4,
                    color: '#ffffff',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    textAlign: 'center',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    marginTop: '30px',
                    marginBottom: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {`"${summaryText}"`}
                </div>

                {/* Bottom Row White Metric Cards */}
                <div style={{ display: 'flex', gap: '24px', width: '100%' }}>

                    {/* Metric 1 */}
                    <div style={{
                        flex: 1, padding: '32px 24px', borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        color: '#334155',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.4)'
                    }}>
                        <div style={{ padding: '16px', borderRadius: '16px', background: '#e0f2fe', color: '#0284c7', display: 'flex' }}>
                            <Users size={32} strokeWidth={2.5} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '28px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <span style={{ display: 'flex' }}>Filler</span>
                        </div>
                        <div style={{ display: 'flex', fontSize: '48px', fontWeight: '800', color: '#ea580c', lineHeight: 1 }}>{formatMetricValue('total_filler_words', metricsMap['total_filler_words'])}</div>
                    </div>

                    {/* Metric 2 */}
                    <div style={{
                        flex: 1, padding: '32px 24px', borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        color: '#334155',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.4)'
                    }}>
                        <div style={{ padding: '16px', borderRadius: '16px', background: '#ccfbf1', color: '#0f766e', display: 'flex' }}>
                            <Clock size={32} strokeWidth={2.5} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '28px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <span style={{ display: 'flex' }}>Pacing</span>
                        </div>
                        <div style={{ display: 'flex', fontSize: '48px', fontWeight: '800', color: '#ea580c', lineHeight: 1 }}>{formatMetricValue('avg_words_per_minute', metricsMap['avg_words_per_minute'])}</div>
                    </div>

                    {/* Metric 3: Strongest Asset */}
                    <div style={{
                        flex: 1, padding: '32px 24px', borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        color: '#334155',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.4)'
                    }}>
                        <div style={{ padding: '16px', borderRadius: '16px', background: '#ffedd5', color: '#c2410c', display: 'flex' }}>
                            <Target size={32} strokeWidth={2.5} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '28px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <span style={{ display: 'flex' }}>Highlight</span>
                        </div>
                        <div style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '20px',
                            fontWeight: '800',
                            color: '#ea580c',
                            lineHeight: 1.2,
                            textAlign: 'center',
                            paddingTop: '8px'
                        }}>
                            {extra.strongest_asset || 'Solid Performance'}
                        </div>
                    </div>

                    {/* Metric 4: Weakest Moment (Replaces missing layout space nicely) */}
                    <div style={{
                        flex: 1, padding: '32px 24px', borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        color: '#334155',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.4)'
                    }}>
                        <div style={{ padding: '16px', borderRadius: '16px', background: '#fee2e2', color: '#b91c1c', display: 'flex' }}>
                            <Target size={32} strokeWidth={2.5} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '28px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <span style={{ display: 'flex' }}>Weak Point</span>
                        </div>
                        <div style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '20px',
                            fontWeight: '800',
                            color: '#b91c1c',
                            lineHeight: 1.2,
                            textAlign: 'center',
                            paddingTop: '8px'
                        }}>
                            {extra.weakest_moment || 'No major issues'}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
});
