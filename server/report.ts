import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';
import type { MetricSnapshot, SessionReport } from './store.js';

const genai = new GoogleGenAI({ apiKey: config.googleApiKey });

function buildReportPrompt(
  mode: string,
  userTranscript: string[],
  aiTranscript: string[],
  metrics: MetricSnapshot[],
  durationSeconds: number
): string {
  const totalFillers = metrics.reduce((sum, m) => {
    return sum + Object.values(m.filler_words).reduce((a, b) => a + b, 0);
  }, 0);

  const avgWpm = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + m.words_per_minute, 0) / metrics.length)
    : 0;

  const tones = metrics.map(m => m.tone);
  const dominantTone = tones.length > 0
    ? tones.sort((a, b) =>
        tones.filter(v => v === b).length - tones.filter(v => v === a).length
      )[0]
    : 'unknown';

  const userSpeech = userTranscript.length > 0
    ? userTranscript.join('\n')
    : '(The user did not speak during this session)';

  const aiSpeech = aiTranscript.length > 0
    ? aiTranscript.join('\n')
    : '(No AI responses recorded)';

  return `
You are an expert speech coach analyzing a completed coaching session.

IMPORTANT: You must evaluate the USER's performance ONLY, NOT the AI coach.
The transcript below clearly labels who said what. Lines starting with [User] are
what the person being coached said. Lines starting with [AI] are what the AI coach said.
You MUST evaluate ONLY the [User] lines.

If the user did not speak or said very little, score them LOW (1-3) and provide
constructive feedback encouraging them to actively participate.

MODE: ${mode}
DURATION: ${durationSeconds} seconds

=== USER'S SPEECH (evaluate THIS) ===
${userSpeech}

=== AI COACH'S SPEECH (context only, do NOT evaluate) ===
${aiSpeech}

USER'S AGGREGATED METRICS:
- Total filler words used by user: ${totalFillers}
- Average words per minute: ${avgWpm}
- Dominant tone: ${dominantTone}
- User transcript entries: ${userTranscript.length}

Generate a detailed performance report evaluating the USER's speaking performance
as a JSON object with this exact structure:
{
  "overall_score": <number 1-10>,
  "categories": {
    "clarity": {"score": <1-10>, "feedback": "<2-3 sentences about the USER's clarity>"},
    "confidence": {"score": <1-10>, "feedback": "<2-3 sentences about the USER's confidence>"},
    "persuasiveness": {"score": <1-10>, "feedback": "<2-3 sentences about the USER's persuasiveness>"},
    "composure": {"score": <1-10>, "feedback": "<2-3 sentences about the USER's composure>"}
  },
  "metrics": {
    "total_filler_words": ${totalFillers},
    "avg_words_per_minute": ${avgWpm},
    "dominant_tone": "${dominantTone}",
    "interruption_recovery_avg_ms": <estimated number>
  },
  "key_moments": [
    {"timestamp": "<mm:ss>", "type": "strength"|"weakness", "note": "<description of USER's moment>"}
  ],
  "improvement_tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

Return ONLY the JSON object, no markdown fences or explanation.
`;
}

export async function generateReport(
  sessionId: string,
  mode: string,
  userTranscript: string[],
  aiTranscript: string[],
  metrics: MetricSnapshot[],
  durationSeconds: number
): Promise<SessionReport> {
  try {
    const prompt = buildReportPrompt(mode, userTranscript, aiTranscript, metrics, durationSeconds);
    console.log(`   [${sessionId}] Report prompt length: ${prompt.length} chars, user entries: ${userTranscript.length}, ai entries: ${aiTranscript.length}`);

    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{ text: prompt }],
      }],
    });

    const text = response.text || '{}';
    // Strip markdown fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      session_id: sessionId,
      mode,
      duration_seconds: durationSeconds,
      ...parsed,
    };
  } catch (error) {
    console.error('Report generation failed:', error);
    return {
      session_id: sessionId,
      mode,
      duration_seconds: durationSeconds,
      overall_score: 0,
      categories: {
        clarity: { score: 0, feedback: 'Report generation failed.' },
        confidence: { score: 0, feedback: 'Report generation failed.' },
        persuasiveness: { score: 0, feedback: 'Report generation failed.' },
        composure: { score: 0, feedback: 'Report generation failed.' },
      },
      metrics: {
        total_filler_words: 0,
        avg_words_per_minute: 0,
        dominant_tone: 'unknown',
        interruption_recovery_avg_ms: 0,
      },
      key_moments: [],
      improvement_tips: ['Unable to generate report. Please try again.'],
    };
  }
}
