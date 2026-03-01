import { GoogleGenAI } from '@google/genai';
import type { WebSocket } from 'ws';
import { config, loadPrompt, type Mode, MODES } from './config.js';
import type { SessionStore } from './store.js';
import { generateReport } from './report.js';
import { createSessionState, getElapsedSeconds } from './session/state.js';
import { injectFeedbackContext } from './session/feedback-context.js';
import { connectGemini, forwardClientMessage } from './session/gemini-bridge.js';
import { sendSessionStarted, sendReport, sendError, isWsOpen } from './session/protocol.js';
import { FEEDBACK_TIMEOUT_MS } from './session/constants.js';
import { runProfiler } from './services/profiler.js';

export interface SessionContext {
  originalSessionId?: string | null;
  organization?: string;
  role?: string;
}

export interface SessionDependencies {
  genai: GoogleGenAI;
  store: SessionStore;
}

export function createDependencies(): SessionDependencies {
  return {
    genai: new GoogleGenAI({ apiKey: config.googleApiKey }),
    store: undefined as any, // Must be set by main.ts via setDependencies
  };
}

const deps: SessionDependencies = createDependencies();

export function setDependencies(overrides: Partial<SessionDependencies>): void {
  if (overrides.genai) deps.genai = overrides.genai;
  if (overrides.store) deps.store = overrides.store;
}

export async function handleConnection(ws: WebSocket, modeStr: string, userId: string, context: SessionContext = {}) {
  // Validate mode
  if (!(modeStr in MODES)) {
    console.error(`❌ Invalid mode: ${modeStr}`);
    sendError(ws, `Invalid mode: ${modeStr}`);
    ws.close();
    return;
  }

  const mode = modeStr as Mode;

  // Fetch existing profile for the user
  const userProfile = await deps.store.getProfile(userId);
  const profileText = userProfile
    ? `\nFACTUAL SUMMARY:\n${userProfile.factualSummary}\n\nCOACHING NOTES:\n${userProfile.coachingNotes}`
    : 'No previous profile data available.';

  // Prepare context map for the prompt template
  const promptContext = {
    ORGANIZATION: context.organization || 'Unknown Company',
    ROLE: context.role || 'Unknown Role',
    USER_PROFILE: profileText,
  };

  const systemPrompt = loadPrompt(mode, promptContext);
  const state = createSessionState(mode, userId, systemPrompt, deps.genai);

  // Feedback mode: inject original session context
  if (mode === 'feedback' && context.originalSessionId) {
    await injectFeedbackContext(state, context.originalSessionId, deps.store);
  }

  console.log(`🎙️  New session: ${state.id} [${mode}] (Voice: ${state.voiceName})`);
  console.log(`   System prompt loaded: ${MODES[mode].promptFile}`);

  try {
    console.log(`   Prompt length: ${state.systemPrompt.length} chars`);
    console.log(`   Connecting to Gemini Live API (${config.geminiModel})...`);

    const bridge = await connectGemini(deps.genai, ws, state, () => {
      state.status = 'closed';
    });

    state.status = 'active';
    console.log(`   [${state.id}] Session object created, waiting for setupComplete...`);

    // Notify client that session is ready
    sendSessionStarted(ws, state.id, mode);

    // Forward browser messages → Gemini
    ws.on('message', (data: Buffer, isBinary: boolean) => {
      try {
        forwardClientMessage(data, isBinary, bridge.session, state, endSession);
      } catch (err) {
        if (state.status !== 'ending') {
          console.error(`   [${state.id}] Error forwarding to Gemini:`, err);
        }
      }
    });

    ws.on('close', () => {
      console.log(`🔌 Client disconnected: ${state.id}`);
      bridge.close();
      state.status = 'closed';
    });

    ws.on('error', (err) => {
      console.error(`   [${state.id}] WebSocket error:`, err);
    });

    // Hard timeout for feedback sessions
    if (mode === 'feedback') {
      setTimeout(() => {
        if (state.status === 'active') {
          console.log(`⏱️ [Feedback] Session ${state.id} timed out (60s limit reached)`);
          sendError(ws, 'Feedback session time limit (1 min) reached.');
          endSession();
        }
      }, FEEDBACK_TIMEOUT_MS);
    }

    // End session function
    async function endSession() {
      if (state.status === 'ending' || state.status === 'closed') return;
      state.status = 'ending';

      const durationSeconds = getElapsedSeconds(state);
      console.log(`⏹️  Session ending: ${state.id} (duration: ${durationSeconds}s, entries: ${state.transcript.length})`);

      bridge.close();

      // Skip report generation for feedback mode
      if (mode === 'feedback') {
        console.log(`   [${state.id}] Skipping report generation for feedback mode.`);
        state.status = 'closed';
        return;
      }

      try {
        console.log(`   [${state.id}] Generating post-session report...`);
        const report = await generateReport(state.id, mode, state.transcript, state.metrics, durationSeconds, state.voiceName);
        console.log(`   [${state.id}] Report generated: overall_score=${report.overall_score}`);

        await deps.store.save({
          id: state.id,
          userId,
          mode,
          startedAt: state.startedAt,
          transcript: state.transcript.map(t => `[${t.role === 'user' ? 'User' : 'AI'}] ${t.text}`),
          metrics: state.metrics,
          report,
          voiceName: state.voiceName,
        });

        if (isWsOpen(ws)) {
          sendReport(ws, report);
          console.log(`   [${state.id}] ✅ Report sent to client`);
        } else {
          console.log(`   [${state.id}] ⚠️ Client already disconnected, report not sent`);
        }

        // Run profiler in the background if this is a supported mode
        if (mode !== 'feedback') {
          console.log(`   [${state.id}] Running background profiler...`);

          const sessionDataForProfiler = {
            id: state.id,
            userId,
            mode,
            startedAt: state.startedAt,
            transcript: state.transcript.map(t => `[${t.role === 'user' ? 'User' : 'AI'}] ${t.text}`),
            metrics: state.metrics,
            voiceName: state.voiceName,
          };

          runProfiler(userId, sessionDataForProfiler, userProfile).then(async (newProfile) => {
            await deps.store.saveProfile(newProfile);
            console.log(`   [${state.id}] ✅ Profile updated for ${userId}:`, newProfile.factualSummary);
          }).catch((err) => {
            console.error(`   [${state.id}] ❌ Profiler failed:`, err);
          });
        }

      } catch (err) {
        console.error(`   [${state.id}] ❌ Error generating report:`, err);
        sendError(ws, 'Failed to generate report. Please try again.');
      }

      state.status = 'closed';
    }

  } catch (error) {
    console.error(`❌ Failed to initialize session ${state.id}:`, error);
    sendError(ws, 'Failed to connect to AI. Check your API key.');
    ws.close();
  }
}
