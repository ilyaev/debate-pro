import { type GoogleGenAI, type LiveServerMessage, Modality } from '@google/genai';
import type { WebSocket } from 'ws';
import { config } from '../config.js';
import type { SessionState } from './state.js';
import { getElapsedSeconds, getAllTextByRole } from './state.js';
import { extractMetrics } from './metrics.js';
import {
  sendTranscriptCue, sendMetrics, sendTurnComplete,
  sendInterrupted, sendError, sendAudioChunk, sendAiDisconnected,
  isWsOpen, parseBinaryMessage,
} from './protocol.js';

export interface GeminiBridge {
  session: any; // Gemini Live session object
  close(): void;
}

/**
 * Connect to the Gemini Live API and wire up all message handlers.
 * Returns a bridge object with the session reference and a close method.
 */
export async function connectGemini(
  genai: GoogleGenAI,
  ws: WebSocket,
  state: SessionState,
  onSessionClosed: () => void,
): Promise<GeminiBridge> {
  let sessionClosed = false;

  const session = await genai.live.connect({
    model: config.geminiModel,
    callbacks: {
      onopen: () => {
        console.log(`   ✅ Gemini Live API connected for session ${state.id}`);
      },

      onmessage: (message: LiveServerMessage) => {
        try {
          if (!isWsOpen(ws)) return;
          handleGeminiMessage(message, session, ws, state);
        } catch (err) {
          console.error(`   [${state.id}] Error processing Gemini response:`, err);
        }
      },

      onerror: (error: ErrorEvent) => {
        console.error(`   [${state.id}] Gemini Live error:`, error.message || error);
        sendError(ws, 'AI session error');
      },

      onclose: (event: CloseEvent) => {
        console.log(`   [${state.id}] Gemini Live connection closed (code: ${event.code}, reason: "${event.reason}")`);
        sessionClosed = true;

        // Flush any remaining AI transcript buffer
        const remaining = state.aiBuffer.forceFlush();
        if (remaining) {
          sendTranscriptCue(ws, remaining, getElapsedSeconds(state));
        }

        // Notify client that AI disconnected (don't auto-end — let user click End Session)
        if (state.status !== 'ending' && isWsOpen(ws)) {
          console.log(`   [${state.id}] Notifying client of AI disconnect`);
          sendAiDisconnected(
            ws,
            event.code === 1000 ? 'Session completed' : 'AI connection interrupted',
          );
        }

        onSessionClosed();
      },
    },
    config: {
      responseModalities: [Modality.AUDIO],
      outputAudioTranscription: {},
      inputAudioTranscription: {},
      systemInstruction: { parts: [{ text: state.systemPrompt }] },
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: state.voiceName,
          },
        },
      },
    },
  });

  return {
    session,
    close() {
      if (!sessionClosed) {
        try { session.close(); } catch (_) { /* already closed */ }
        sessionClosed = true;
      }
    },
  };
}

// ─── Gemini message dispatch ──────────────────────────────────────────────────

function handleGeminiMessage(
  message: LiveServerMessage,
  session: any,
  ws: WebSocket,
  state: SessionState,
): void {
  const serverContent = message.serverContent;

  if (message.setupComplete) {
    handleSetupComplete(session, state);
    return;
  }

  if (!serverContent) {
    if (message.toolCall) {
      console.log(`   [${state.id}] ← toolCall:`, JSON.stringify(message.toolCall).slice(0, 200));
    }
    return;
  }

  if (serverContent.interrupted) {
    handleInterrupted(ws, state);
    return;
  }

  if (serverContent.inputTranscription?.text) {
    handleUserTranscription(serverContent.inputTranscription.text, ws, state);
  }

  if (serverContent.outputTranscription?.text) {
    handleAiTranscription(serverContent.outputTranscription.text, ws, state);
  }

  if (serverContent.modelTurn?.parts) {
    handleModelTurn(serverContent.modelTurn.parts, ws, state);
  }

  if (serverContent.turnComplete) {
    handleTurnComplete(ws, state);
  }
}

// ─── Individual message handlers ──────────────────────────────────────────────

function handleSetupComplete(session: any, state: SessionState): void {
  console.log(`   [${state.id}] ← setupComplete`);
  try {
    session.sendClientContent({
      turns: [{ role: 'user', parts: [{ text: "Hello! Let's begin the scenario." }] }],
      turnComplete: true,
    });
    console.log(`   [${state.id}] Initial greeting sent to trigger AI intro`);
  } catch (err) {
    console.error(`   [${state.id}] Failed to send initial greeting:`, err);
  }
}

function handleInterrupted(ws: WebSocket, state: SessionState): void {
  console.log(`   [${state.id}] ← interrupted (barge-in)`);
  sendInterrupted(ws);
}

function handleUserTranscription(text: string, ws: WebSocket, state: SessionState): void {
  state.userBuffer.append(text);
  const flushed = state.userBuffer.tryFlush();
  if (!flushed) return;

  console.log(`   [${state.id}] ← user: "${flushed.slice(0, 100)}"`);

  const elapsed = getElapsedSeconds(state);
  sendTranscriptCue(ws, `[User]: ${flushed}`, elapsed);
  state.transcript.push({ role: 'user', text: flushed, timestamp: elapsed });

  const allUserText = getAllTextByRole(state, 'user');
  const allAiText = getAllTextByRole(state, 'ai');

  // Trigger background tone analysis (fire-and-forget)
  const tonePromise = state.toneAnalyzer.tryAnalyze(allUserText);
  if (tonePromise) {
    tonePromise.then(result => {
      if (result && isWsOpen(ws)) {
        const latestElapsed = getElapsedSeconds(state);
        const toneMetric = extractMetrics(allUserText, allAiText, latestElapsed, state.mode, result.tone, result.hint);
        sendMetrics(ws, toneMetric);
      }
    });
  }

  // Emit current metrics
  const metric = extractMetrics(allUserText, allAiText, elapsed, state.mode, state.toneAnalyzer.getTone(), state.toneAnalyzer.getHint());
  state.metrics.push(metric);
  sendMetrics(ws, metric);
}

function handleAiTranscription(text: string, ws: WebSocket, state: SessionState): void {
  state.aiBuffer.append(text);
  const flushed = state.aiBuffer.tryFlush();
  if (!flushed) return;

  console.log(`   [${state.id}] ← AI: "${flushed.slice(0, 120)}"`);
  const elapsed = getElapsedSeconds(state);
  sendTranscriptCue(ws, flushed, elapsed);
  state.transcript.push({ role: 'ai', text: flushed, timestamp: elapsed });
}

function handleModelTurn(parts: any[], ws: WebSocket, state: SessionState): void {
  for (const part of parts) {
    if (part.inlineData?.data) {
      sendAudioChunk(ws, part.inlineData.data);
    }
    if (part.text) {
      console.log(`   [${state.id}] ← text part (thought): "${part.text.split('\n')[0].slice(0, 100)}..."`);
    }
  }
}

function handleTurnComplete(ws: WebSocket, state: SessionState): void {
  console.log(`   [${state.id}] ← turnComplete`);
  sendTurnComplete(ws);
}

// ─── Client → Gemini audio/video forwarding ──────────────────────────────────

export function forwardClientMessage(
  data: Buffer,
  isBinary: boolean,
  session: any,
  state: SessionState,
  onEndSession: () => void,
): void {
  // Text messages are JSON commands
  if (!isBinary) {
    const msg = JSON.parse(data.toString('utf-8'));
    console.log(`   [${state.id}] → client command: ${msg.type}`);
    if (msg.type === 'end_session') {
      onEndSession();
    } else if (msg.type === 'pause_session') {
      try {
        session.sendClientContent({
          turns: [{ role: 'user', parts: [{ text: "SYSTEM: The user has paused the session. Please stand by. CRITICAL: Do NOT acknowledge this message. Do NOT say 'ok' or make any comment about pausing. Remain completely silent." }] }],
          turnComplete: true,
        });
        console.log(`   [${state.id}] Sent pause notification to Gemini.`);
      } catch (err) {
        console.error(`   [${state.id}] Failed to send pause instruction:`, err);
      }
    } else if (msg.type === 'resume_session') {
      try {
        session.sendClientContent({
          turns: [{ role: 'user', parts: [{ text: "SYSTEM: The user has resumed the session. You may continue the conversation. CRITICAL: Do NOT acknowledge this message. Do NOT make any comment about resuming or pausing. Just continue naturally from where we left off." }] }],
          turnComplete: true,
        });
        console.log(`   [${state.id}] Sent resume notification to Gemini.`);
      } catch (err) {
        console.error(`   [${state.id}] Failed to send resume instruction:`, err);
      }
    }
    return;
  }

  if (state.status === 'ending' || state.status === 'closed') return;

  state.audioChunkCount++;
  const payload = parseBinaryMessage(data);
  if (!payload) {
    console.error(`   [${state.id}] ❌ Invalid binary payload`);
    return;
  }

  const b64 = payload.data.toString('base64');

  if (payload.type === 'video') {
    try {
      session.sendRealtimeInput({
        video: { data: b64, mimeType: 'image/jpeg' },
      });
    } catch (err: any) {
      console.error(`   [${state.id}] ❌ Video send error (chunk #${state.audioChunkCount}):`, err.message || err);
    }
  } else {
    if (state.audioChunkCount <= 3 || state.audioChunkCount % 100 === 0 || (state.mode === 'feedback' && state.audioChunkCount < 20)) {
      console.log(`   [${state.id}] → audio #${state.audioChunkCount}: ${payload.data.length} bytes, b64_len=${b64.length} (mode: ${state.mode})`);
    }
    try {
      session.sendRealtimeInput({
        audio: { data: b64, mimeType: 'audio/pcm;rate=16000' },
      });
    } catch (err: any) {
      console.error(`   [${state.id}] ❌ Audio send error (chunk #${state.audioChunkCount}):`, err.message || err);
    }
  }
}
