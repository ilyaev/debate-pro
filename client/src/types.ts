export interface MetricSnapshot {
  filler_words: Record<string, number>;
  words_per_minute: number;
  tone: string;
  key_phrases: string[];
  improvement_hint: string;
}

export interface SessionReport {
  session_id: string;
  mode: string;
  duration_seconds: number;
  overall_score: number;
  categories: Record<string, { score: number; feedback: string }>;
  metrics: {
    total_filler_words: number;
    avg_words_per_minute: number;
    dominant_tone: string;
    interruption_recovery_avg_ms: number;
  };
  key_moments: Array<{ timestamp: string; type: 'strength' | 'weakness'; note: string }>;
  improvement_tips: string[];
}

export interface CoachingCue {
  text: string;
  timestamp: number;
}
