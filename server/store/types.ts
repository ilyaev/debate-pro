export interface MetricSnapshot {
  filler_words: Record<string, number>;
  words_per_minute: number;
  tone: string;
  key_phrases: string[];
  improvement_hint: string;
  timestamp: number;
  talk_ratio: number;
  clarity_score: number;
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
    avg_talk_ratio: number;
    avg_clarity_score: number;
  };
  key_moments: Array<{ timestamp: string; type: 'strength' | 'weakness'; note: string }>;
  improvement_tips: string[];
  social_share_texts?: {
    performance_card_summary: string;
    linkedin_template: string;
    twitter_template: string;
    facebook_template: string;
  };
  /** Scenario-specific extra fields (fallacies, phrases, topic, etc.) */
  extra?: Record<string, unknown>;
  /** Which metric keys from `metrics` are relevant for this mode */
  displayMetrics?: string[];
  /** The name of the AI voice used in this session */
  voiceName?: string;
}

export interface SessionData {
  id: string;
  userId: string;
  mode: string;
  startedAt: Date;
  transcript: string[];
  metrics: MetricSnapshot[];
  report?: SessionReport;
  voiceName?: string;
}

export interface SessionSummary {
  id: string;
  userId: string;
  mode: string;
  startedAt: Date;
  duration_seconds: number;
  overall_score: number;
  preview_text: string;
  voiceName: string;
}

export interface UserProfile {
  userId: string;
  factualSummary: string;
  coachingNotes: string;
  lastUpdated: Date;
}

export interface InterviewPreset {
  id: string; // auto-generated
  userId: string;
  presetName: string;
  organization: string;
  role: string;
  background?: string;
  lastUsedAt: Date;
}

export interface SessionStore {
  save(session: SessionData): Promise<void>;
  get(id: string): Promise<SessionData | null>;
  listByUser(userId: string): Promise<SessionSummary[]>;

  // Profiles
  saveProfile(profile: UserProfile): Promise<void>;
  getProfile(userId: string): Promise<UserProfile | null>;

  // Presets
  savePreset(preset: Omit<InterviewPreset, 'id'> & { id?: string }): Promise<InterviewPreset>;
  listPresets(userId: string): Promise<InterviewPreset[]>;
}
