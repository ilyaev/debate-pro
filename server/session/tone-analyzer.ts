import type { GoogleGenAI } from '@google/genai';
import { TONE_CHECK_INTERVAL_MS, TONE_ANALYSIS_TEXT_LIMIT, TONE_MIN_WORDS } from './constants.js';

export interface ToneResult {
  tone: string;
  hint: string;
}

export class ToneAnalyzer {
  private lastCheck = Date.now();
  private currentTone = 'Neutral';
  private currentHint = '';
  private genai: GoogleGenAI;
  private sessionId: string;

  constructor(genai: GoogleGenAI, sessionId: string) {
    this.genai = genai;
    this.sessionId = sessionId;
  }

  getTone(): string {
    return this.currentTone;
  }

  getHint(): string {
    return this.currentHint;
  }

  /**
   * Trigger a background tone analysis if enough time has passed and enough text exists.
   * Returns a promise that resolves to the new tone/hint if analysis was triggered, null otherwise.
   * The caller can optionally await or fire-and-forget.
   */
  tryAnalyze(allUserText: string): Promise<ToneResult | null> | null {
    const now = Date.now();
    const wordCount = allUserText.split(' ').length;

    if (now - this.lastCheck <= TONE_CHECK_INTERVAL_MS || wordCount <= TONE_MIN_WORDS) {
      return null;
    }

    this.lastCheck = now;

    return this.genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following text from a user in a speech training session. Return a JSON object with two fields: "tone" (exactly one word describing the emotional tone of the speaker, e.g., Confident, Nervous, Defensive, Excited, Thoughtful, Frustrated) and "hint" (a very short, one-sentence actionable training hint for the user based on the current context). If no specific hint is needed, "hint" can be empty.\n\nText: "${allUserText.slice(-TONE_ANALYSIS_TEXT_LIMIT)}"`,
      config: {
        responseMimeType: "application/json"
      }
    }).then(res => {
      try {
        const json = JSON.parse(res.text || '{}');
        const newTone = json.tone ? json.tone.trim().replace(/[^a-zA-Z]/g, '') : null;
        const newHint = json.hint ? `${json.hint}` : '';

        if (newTone) {
          this.currentTone = newTone;
          this.currentHint = newHint;
          return { tone: this.currentTone, hint: this.currentHint };
        }
        return null;
      } catch (e) {
        console.error(`   [${this.sessionId}] Failed to parse LLM JSON response:`, e);
        return null;
      }
    }).catch(err => {
      console.error(`   [${this.sessionId}] Background tone/hint analysis failed:`, err);
      return null;
    });
  }
}
