export const METRIC_LABELS: Record<string, string> = {
    total_filler_words: 'Filler Words',
    avg_words_per_minute: 'Avg WPM',
    dominant_tone: 'Dominant Tone',
    interruption_recovery_avg_ms: 'Recovery Time',
    avg_talk_ratio: 'Talk Ratio',
    avg_clarity_score: 'Clarity Score',
};

export function scoreColor(score: number): string {
    if (score >= 7) return 'score--green';
    if (score >= 4) return 'score--orange';
    return 'score--red';
}

export function formatMetricValue(key: string, val: number | string): string {
    if (key === 'interruption_recovery_avg_ms' && typeof val === 'number') {
        return `${(val / 1000).toFixed(1)}s`;
    }
    if (key === 'avg_talk_ratio' && typeof val === 'number') {
        return `${val}%`;
    }
    return String(val);
}
