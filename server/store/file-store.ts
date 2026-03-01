import type { SessionData, SessionSummary, UserProfile, InterviewPreset, SessionStore } from './types.js';

// --- File-based store (local development — survives server restarts) ---
export class FileStore implements SessionStore {
  private filePath: string;
  private data: Record<string, SessionData> = {};
  private profiles: Record<string, UserProfile> = {};
  private presets: Record<string, InterviewPreset> = {};
  private loaded = false;

  constructor(filePath?: string) {
    // Default to <project-root>/sessions.json  (one level above /server/dist/store)
    this.filePath = filePath ?? new URL('../../../sessions.json', import.meta.url).pathname;
  }

  private async load(): Promise<void> {
    // if (this.loaded) return;
    try {
      const { readFile } = await import('fs/promises');
      const raw = await readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);

      const parsedData = parsed.sessions || parsed; // Backwards compatibility
      // Rehydrate Date fields
      for (const [id, session] of Object.entries(parsedData) as [string, any][]) {
        this.data[id] = { ...session, startedAt: new Date(session.startedAt) };
      }

      this.profiles = {};
      if (parsed.profiles) {
        for (const [id, profile] of Object.entries(parsed.profiles) as [string, any][]) {
          this.profiles[id] = { ...profile, lastUpdated: new Date(profile.lastUpdated) };
        }
      }

      this.presets = {};
      if (parsed.presets) {
        for (const [id, preset] of Object.entries(parsed.presets) as [string, any][]) {
          this.presets[id] = { ...preset, lastUsedAt: new Date(preset.lastUsedAt) };
        }
      }
    } catch {
      // File doesn't exist yet — start empty
      this.data = {};
      this.profiles = {};
      this.presets = {};
    }
    this.loaded = true;
  }

  private async flush(): Promise<void> {
    const { writeFile, rename } = await import('fs/promises');
    const tmp = this.filePath + '.tmp';
    const payload = {
      sessions: this.data,
      profiles: this.profiles,
      presets: this.presets,
    };
    await writeFile(tmp, JSON.stringify(payload, null, 2), 'utf-8');
    await rename(tmp, this.filePath);
  }

  async save(session: SessionData): Promise<void> {
    await this.load();
    this.data[session.id] = session;
    await this.flush();
    console.log(`💾 [FileStore] Session ${session.id} saved → ${this.filePath}`);
  }

  async get(id: string): Promise<SessionData | null> {
    await this.load();
    return this.data[id] ?? null;
  }

  async listByUser(userId: string): Promise<SessionSummary[]> {
    await this.load();
    const results: SessionSummary[] = [];
    for (const session of Object.values(this.data)) {
      if (session.userId === userId) {
        results.push({
          id: session.id,
          userId: session.userId,
          mode: session.mode,
          startedAt: session.startedAt,
          duration_seconds: session.report?.duration_seconds ?? 0,
          overall_score: session.report?.overall_score ?? 0,
          preview_text: session.report?.social_share_texts?.performance_card_summary ?? '',
          voiceName: session.voiceName ?? 'AI Coach',
        });
      }
    }
    return results.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.load();
    this.profiles[profile.userId] = profile;
    await this.flush();
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    await this.load();
    return this.profiles[userId] ?? null;
  }

  async savePreset(preset: Omit<InterviewPreset, 'id'> & { id?: string }): Promise<InterviewPreset> {
    await this.load();
    const id = preset.id || Math.random().toString(36).substring(2, 9);
    const fullPreset = { ...preset, id, lastUsedAt: preset.lastUsedAt || new Date() } as InterviewPreset;
    this.presets[id] = fullPreset;
    await this.flush();
    return fullPreset;
  }

  async listPresets(userId: string): Promise<InterviewPreset[]> {
    await this.load();
    return Object.values(this.presets)
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.lastUsedAt.getTime() - a.lastUsedAt.getTime());
  }
}
