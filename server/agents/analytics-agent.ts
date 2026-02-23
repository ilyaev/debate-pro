import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import type { MetricSnapshot } from '../store.js';

const genai = new GoogleGenAI({ apiKey: config.googleApiKey });

/**
 * Analytics Agent — processes transcript chunks and returns structured metrics.
 *
 * This agent runs separately from the voice session. It receives periodic
 * transcript text and returns JSON metrics (filler words, WPM, tone, etc.)
 * that are displayed on the client dashboard in real-time.
 */

const ANALYTICS_PROMPT = `
You are a speech analytics engine. You receive transcript chunks
and return structured metrics.

For each chunk, return ONLY a JSON object with this exact structure:
{
  "filler_words": {"um": 0, "like": 0, "you know": 0, "uh": 0, "so": 0, "basically": 0},
  "words_per_minute": 0,
  "tone": "neutral",
  "key_phrases": [],
  "improvement_hint": ""
}

Rules:
- "tone" must be one of: "confident", "nervous", "defensive", "neutral", "aggressive", "uncertain"
- "words_per_minute" should be estimated from the text length and typical speaking pace
- "filler_words" should count occurrences of common filler words in the transcript
- "improvement_hint" should be a single actionable suggestion
- Return ONLY the JSON, no markdown fences or explanation
`;

export async function analyzeTranscript(
  transcriptChunk: string
): Promise<MetricSnapshot | null> {
  try {
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `Analyze this transcript chunk:\n\n"${transcriptChunk}"` }],
      }],
      config: {
        systemInstruction: ANALYTICS_PROMPT,
      },
    });

    const text = response.text || '{}';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      ...parsed,
      timestamp: Date.now(),
    } as MetricSnapshot;
  } catch (error) {
    console.error('Analytics agent error:', error);
    return null;
  }
}
