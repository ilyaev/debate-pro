import type { SessionStore } from '../store.js';
import type { SessionState } from './state.js';

/**
 * For feedback mode sessions, inject the original session's transcript and report
 * into the system prompt so the AI has context to provide feedback on.
 */
export async function injectFeedbackContext(
  state: SessionState,
  originalSessionId: string,
  store: SessionStore,
): Promise<void> {
  console.log(`🔍 [Feedback] Fetching original session: ${originalSessionId}`);
  try {
    const originalSession = await store.get(originalSessionId);
    if (!originalSession) {
      console.warn(`⚠️ [Feedback] Original session ${originalSessionId} not found in store.`);
      return;
    }

    state.voiceName = (originalSession.voiceName as any) || state.voiceName;
    const transcriptSummary = originalSession.transcript.slice(-20).join('\n');
    const reportSummary = originalSession.report
      ? `Report Summary: Overall Score ${originalSession.report.overall_score}/10. Categories: ${Object.entries(originalSession.report.categories).map(([k, v]: [string, any]) => `${k}:${v.score}`).join(', ')}`
      : '';

    const contextInjection = `
## ORIGINAL SESSION CONTEXT
Below is the content and metrics from the session you are providing feedback on.
MODE: ${originalSession.mode}
${reportSummary}

TRANSCRIPT (Last 20 lines):
${transcriptSummary}
`;
    state.systemPrompt = contextInjection + '\n' + state.systemPrompt;
    console.log(`✅ [Feedback] Context injected for session ${originalSessionId}`);
  } catch (err) {
    console.error(`❌ [Feedback] Error fetching original session:`, err);
  }
}
