import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config.js';
import { UserProfile, SessionData } from '../store.js';

const genai = new GoogleGenAI({ apiKey: config.googleApiKey });

function getProfilerPrompt(mode: string): string {
  const isFactMode = mode === 'professional_introduction';

  const factualInstructions = isFactMode
    ? `An updated, concise paragraph summarizing the user's professional background, experience, and the specific projects/roles they have pitched. Add new facts from this session, but KEEP previous facts. Be extremely concise. If the user provided no new factual information in the transcript, YOU MUST RETURN THE EXACT EXISTING FACTUAL SUMMARY verbatim.`
    : `DO NOT EXTRACT ANY NEW FACTUAL INFORMATION from this session, because this session was a fictional roleplay (mode: ${mode}). YOU MUST RETURN THE EXACT EXISTING FACTUAL SUMMARY verbatim.`;

  return `You are a specialized behavioral analyst and professional coach.
Your task is to analyze a practice session and extract key insights to build the user's persistent profile.

You will receive:
1. The user's EXISTING profile (Factual Summary & Coaching Notes).
2. The transcript of their LATEST session.

You must return a JSON object containing:
1. factualSummary: ${factualInstructions}
2. coachingNotes: An updated set of bullet points detailing the user's communication style, strengths, and areas for improvement. Focus on behavioral patterns (e.g., "Rattles when interrupted", "Needs to use the STAR method", "Excellent tonal confidence"). Merge new observations with existing ones. Drop notes if the user has clearly fixed the issue. If the user barely spoke or provided no new behavioral data, YOU MUST RETURN THE EXACT EXISTING COACHING NOTES verbatim.

OUTPUT FORMAT MUST BE VALID JSON:
{
  "factualSummary": "...",
  "coachingNotes": "..."
}
`;
}

export async function runProfiler(userId: string, sessionData: SessionData, existingProfile: UserProfile | null): Promise<UserProfile> {
  if (!sessionData.transcript || sessionData.transcript.length === 0) {
    console.log(`[Profiler] Skipping profiling for ${userId} — empty transcript.`);
    return existingProfile || { userId, factualSummary: '', coachingNotes: '', lastUpdated: new Date() };
  }

  console.log(`[Profiler] Running analysis for user ${userId}...`);

  const transcriptText = sessionData.transcript.join('\n');
  const existingFacts = existingProfile?.factualSummary || 'None recorded yet.';
  const existingNotes = existingProfile?.coachingNotes || 'None recorded yet.';

  const prompt = `
EXISTING FACTUAL SUMMARY:
${existingFacts}

EXISTING COACHING NOTES:
${existingNotes}

-- LATEST SESSION TRANSCRIPT --
${transcriptText}
`;

  try {
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getProfilerPrompt(sessionData.mode),
        temperature: 0.2, // Keep it grounded
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            factualSummary: { type: Type.STRING },
            coachingNotes: { type: Type.STRING },
          },
          required: ['factualSummary', 'coachingNotes'],
        },
      },
    });

    if (!response.text) {
      throw new Error('No text returned from Gemini for Profiler.');
    }

    const result = JSON.parse(response.text);
    console.log(`[Profiler] Analysis result JSON for ${userId}:`, result);

    return {
      userId,
      factualSummary: result.factualSummary,
      coachingNotes: result.coachingNotes,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error(`[Profiler] ❌ Error analyzing session for user ${userId}:`, error);
    // Return existing profile so we don't overwrite with blanks on error
    return existingProfile || { userId, factualSummary: '', coachingNotes: '', lastUpdated: new Date() };
  }
}
