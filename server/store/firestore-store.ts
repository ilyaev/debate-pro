import type { SessionData, SessionSummary, UserProfile, InterviewPreset, SessionStore } from './types.js';

// --- Firestore store (production) ---
export class FirestoreStore implements SessionStore {
  private db: any;

  constructor() {
    // Dynamic import to avoid requiring Firestore in dev
  }

  private async getDb() {
    if (!this.db) {
      const { Firestore } = await import('@google-cloud/firestore');
      this.db = new Firestore();
    }
    return this.db;
  }

  async save(session: SessionData) {
    console.log(`📦 [Firestore] Saving session: ${session.id}...`);
    try {
      const db = await this.getDb();
      await db.collection('sessions').doc(session.id).set({
        ...session,
        startedAt: session.startedAt.toISOString(),
      });
      console.log(`📦 [Firestore] ✅ Session ${session.id} saved successfully.`);
    } catch (err) {
      console.error(`📦 [Firestore] ❌ Error saving session ${session.id}:`, err);
      throw err;
    }
  }

  async get(id: string) {
    console.log(`📦 [Firestore] Fetching session: ${id}...`);
    try {
      const db = await this.getDb();
      const doc = await db.collection('sessions').doc(id).get();
      if (!doc.exists) {
        console.log(`📦 [Firestore] ⚠️ Session ${id} not found.`);
        return null;
      }
      const data = doc.data();
      console.log(`📦 [Firestore] ✅ Session ${id} retrieved.`);
      return { ...data, startedAt: new Date(data.startedAt) } as SessionData;
    } catch (err) {
      console.error(`📦 [Firestore] ❌ Error fetching session ${id}:`, err);
      throw err;
    }
  }

  async listByUser(userId: string): Promise<SessionSummary[]> {
    console.log(`📦 [Firestore] Listing sessions for user: ${userId}...`);
    try {
      const db = await this.getDb();
      const snap = await db
        .collection('sessions')
        .where('userId', '==', userId)
        .orderBy('startedAt', 'desc')
        .limit(50)
        .get();

      const results: SessionSummary[] = snap.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          mode: data.mode,
          startedAt: new Date(data.startedAt),
          duration_seconds: data.report?.duration_seconds ?? 0,
          overall_score: data.report?.overall_score ?? 0,
          preview_text: data.report?.social_share_texts?.performance_card_summary ?? '',
          voiceName: data.voiceName ?? 'AI Coach',
        };
      });
      console.log(`📦 [Firestore] ✅ Found ${results.length} sessions for user ${userId}.`);
      return results;
    } catch (err) {
      console.error(`📦 [Firestore] ❌ Error listing sessions for user ${userId}:`, err);
      throw err;
    }
  }

  // --- Profiles ---
  async saveProfile(profile: UserProfile): Promise<void> {
    console.log(`📦 [Firestore] Saving profile for user: ${profile.userId}...`);
    try {
      const db = await this.getDb();
      await db.collection('users').doc(profile.userId).collection('profile').doc('aggregate').set({
        ...profile,
        lastUpdated: profile.lastUpdated.toISOString(),
      });
      console.log(`📦 [Firestore] ✅ Profile saved successfully.`);
    } catch (err) {
      console.error(`📦 [Firestore] ❌ Error saving profile:`, err);
      throw err;
    }
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    console.log(`📦 [Firestore] Fetching profile for user: ${userId}...`);
    try {
      const db = await this.getDb();
      const doc = await db.collection('users').doc(userId).collection('profile').doc('aggregate').get();
      if (!doc.exists) return null;

      const data = doc.data();
      return { ...data, lastUpdated: new Date(data.lastUpdated) } as UserProfile;
    } catch (err) {
      console.error(`📦 [Firestore] ❌ Error fetching profile:`, err);
      throw err;
    }
  }

  // --- Presets ---
  async savePreset(preset: Omit<InterviewPreset, 'id'> & { id?: string }): Promise<InterviewPreset> {
    console.log(`📦 [Firestore] Saving preset for user: ${preset.userId}...`);
    try {
      const db = await this.getDb();
      const presetsRef = db.collection('users').doc(preset.userId).collection('interview_presets');

      let docRef;
      if (preset.id) {
        docRef = presetsRef.doc(preset.id);
      } else {
        docRef = presetsRef.doc();
      }

      const fullPreset = {
        ...preset,
        id: docRef.id,
        lastUsedAt: (preset.lastUsedAt || new Date()).toISOString(),
      };

      await docRef.set(fullPreset);
      console.log(`📦 [Firestore] ✅ Preset saved with ID: ${docRef.id}`);

      return { ...fullPreset, lastUsedAt: new Date(fullPreset.lastUsedAt) } as InterviewPreset;
    } catch (err) {
      console.error(`📦 [Firestore] ❌ Error saving preset:`, err);
      throw err;
    }
  }

  async listPresets(userId: string): Promise<InterviewPreset[]> {
    console.log(`📦 [Firestore] Listing presets for user: ${userId}...`);
    try {
      const db = await this.getDb();
      const snap = await db
        .collection('users')
        .doc(userId)
        .collection('interview_presets')
        .orderBy('lastUsedAt', 'desc')
        .limit(20)
        .get();

      return snap.docs.map((doc: any) => {
        const data = doc.data();
        return {
          ...data,
          lastUsedAt: new Date(data.lastUsedAt),
        } as InterviewPreset;
      });
    } catch (err) {
      console.error(`📦 [Firestore] ❌ Error listing presets:`, err);
      throw err;
    }
  }
}
