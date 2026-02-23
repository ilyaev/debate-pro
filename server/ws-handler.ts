import { GoogleGenAI, type LiveServerMessage, Modality } from '@google/genai';
import type { WebSocket } from 'ws';
import { config, loadPrompt, type Mode, MODES } from './config.js';
import { createStore, type MetricSnapshot } from './store.js';
import { generateReport } from './report.js';
import { randomUUID } from 'crypto';

const genai = new GoogleGenAI({ apiKey: config.googleApiKey });
const store = createStore();

// Simple filler word detection for real-time metrics
const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'so', 'right', 'well', 'i mean'];

function extractMetrics(text: string, elapsedSeconds: number): MetricSnapshot {
  const lower = text.toLowerCase();
  const fillerCounts: Record<string, number> = {};
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      fillerCounts[filler] = matches.length;
    }
  }

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.max(elapsedSeconds / 60, 0.1);
  const wpm = Math.round(wordCount / minutes);

  // Simple tone heuristic
  let tone = 'neutral';
  if (lower.includes('!') || lower.includes('confident') || lower.includes('sure')) tone = 'confident';
  else if (lower.includes('?') && wordCount < 10) tone = 'uncertain';
  else if (lower.includes('sorry') || lower.includes('maybe')) tone = 'nervous';

  return {
    filler_words: fillerCounts,
    words_per_minute: wpm,
    tone,
    key_phrases: [],
    improvement_hint: Object.keys(fillerCounts).length > 0
      ? `Try reducing filler words like "${Object.keys(fillerCounts)[0]}"`
      : '',
    timestamp: Date.now(),
  };
}

export async function handleConnection(ws: WebSocket, modeStr: string) {
  // Validate mode
  if (!(modeStr in MODES)) {
    console.error(`❌ Invalid mode: ${modeStr}`);
    ws.send(JSON.stringify({ type: 'error', message: `Invalid mode: ${modeStr}` }));
    ws.close();
    return;
  }

  const mode = modeStr as Mode;
  const sessionId = randomUUID();
  const startedAt = new Date();
  const userTranscript: string[] = [];  // What the user said
  const aiTranscript: string[] = [];    // What the AI said
  const metrics: MetricSnapshot[] = [];
  let sessionClosed = false;
  let endingSession = false;
  let userTranscriptBuffer = '';
  let aiTranscriptBuffer = '';

  console.log(`🎙️  New session: ${sessionId} [${mode}]`);
  console.log(`   System prompt loaded: ${MODES[mode]}`);

  try {
    const systemPrompt = loadPrompt(mode);
    console.log(`   Prompt length: ${systemPrompt.length} chars`);
    console.log(`   Connecting to Gemini Live API (${config.geminiModel})...`);

    // Open a Gemini Live API session using the callbacks pattern
    const session = await genai.live.connect({
      model: config.geminiModel,
      callbacks: {
        onopen: () => {
          console.log(`   ✅ Gemini Live API connected for session ${sessionId}`);
        },
        onmessage: (message: LiveServerMessage) => {
          try {
            if (ws.readyState !== ws.OPEN) return;

            const serverContent = message.serverContent;

            // Log what type of message we received
            if (message.setupComplete) {
              console.log(`   [${sessionId}] ← setupComplete`);
              return;
            }

            if (!serverContent) {
              if (message.toolCall) {
                console.log(`   [${sessionId}] ← toolCall:`, JSON.stringify(message.toolCall).slice(0, 200));
              }
              return;
            }

            // Handle interruption (barge-in)
            if (serverContent.interrupted) {
              console.log(`   [${sessionId}] ← interrupted (barge-in)`);
              ws.send(JSON.stringify({ type: 'interrupted' }));
              return;
            }

            // Handle user speech transcription (what the user said)
            if (serverContent.inputTranscription?.text) {
              const text = serverContent.inputTranscription.text;
              userTranscriptBuffer += text;
              userTranscript.push(text);

              // Flush user metrics on sentence boundary or enough words
              const isSentenceEnd = /[.?!]$/.test(userTranscriptBuffer.trim());
              const wordCount = userTranscriptBuffer.trim().split(/\s+/).length;
              if (isSentenceEnd || wordCount >= 10) {
                console.log(`   [${sessionId}] ← user: "${userTranscriptBuffer.trim().slice(0, 100)}"`);
                const allUserText = userTranscript.join(' ');
                const elapsed = Math.round((Date.now() - startedAt.getTime()) / 1000);
                const metric = extractMetrics(allUserText, elapsed);
                metrics.push(metric);
                ws.send(JSON.stringify({ type: 'metrics', data: metric }));
                userTranscriptBuffer = '';
              }
            }

            // Handle AI speech transcription (what the AI said)
            if (serverContent.outputTranscription?.text) {
              const text = serverContent.outputTranscription.text;
              aiTranscriptBuffer += text;
              aiTranscript.push(text);

              // Flush to client on sentence boundary or enough words
              const isSentenceEnd = /[.?!:"]$/.test(aiTranscriptBuffer.trim());
              const wordCount = aiTranscriptBuffer.trim().split(/\s+/).length;
              if (isSentenceEnd || wordCount >= 15) {
                const flushed = aiTranscriptBuffer.trim();
                console.log(`   [${sessionId}] ← AI: "${flushed.slice(0, 120)}"`);
                ws.send(JSON.stringify({
                  type: 'coaching_cue',
                  text: flushed,
                  timestamp: Math.round((Date.now() - startedAt.getTime()) / 1000),
                }));
                aiTranscriptBuffer = '';
              }
            }

            // Handle model output (audio chunks)
            if (serverContent.modelTurn?.parts) {
              for (const part of serverContent.modelTurn.parts) {
                // Audio response
                if (part.inlineData?.data) {
                  const audioBuffer = Buffer.from(part.inlineData.data, 'base64');
                  ws.send(audioBuffer);
                }

                // Text response (rare for native audio, but handle it)
                if (part.text) {
                  console.log(`   [${sessionId}] ← text part: "${part.text.slice(0, 100)}"`);
                  aiTranscript.push(part.text);
                }
              }
            }

            // Handle turn completion
            if (serverContent.turnComplete) {
              console.log(`   [${sessionId}] ← turnComplete`);
              ws.send(JSON.stringify({ type: 'turn_complete' }));
            }
          } catch (err) {
            console.error(`   [${sessionId}] Error processing Gemini response:`, err);
          }
        },
        onerror: (error: ErrorEvent) => {
          console.error(`   [${sessionId}] Gemini Live error:`, error.message || error);
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: 'error', message: 'AI session error' }));
          }
        },
        onclose: (event: CloseEvent) => {
          console.log(`   [${sessionId}] Gemini Live connection closed (code: ${event.code}, reason: "${event.reason}")`);
          sessionClosed = true;

          // Flush any remaining transcript buffer
          if (aiTranscriptBuffer.trim()) {
            ws.send(JSON.stringify({
              type: 'coaching_cue',
              text: aiTranscriptBuffer.trim(),
              timestamp: Math.round((Date.now() - startedAt.getTime()) / 1000),
            }));
            aiTranscriptBuffer = '';
          }

          // Notify client that AI disconnected (don't auto-end — let user click End Session)
          if (!endingSession && ws.readyState === ws.OPEN) {
            console.log(`   [${sessionId}] Notifying client of AI disconnect`);
            ws.send(JSON.stringify({
              type: 'ai_disconnected',
              message: event.code === 1000 ? 'Session completed' : 'AI connection interrupted',
            }));
          }
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    });

    console.log(`   [${sessionId}] Session object created, waiting for setupComplete...`);

    // Send system instruction as client content after connection is established
    try {
      session.sendClientContent({
        turns: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        turnComplete: true,
      });
      console.log(`   [${sessionId}] System prompt sent via sendClientContent`);
    } catch (err) {
      console.error(`   [${sessionId}] Failed to send system prompt:`, err);
    }

    // Notify client that session is ready
    ws.send(JSON.stringify({ type: 'session_started', sessionId, mode }));

    // Forward browser audio → Gemini
    ws.on('message', (data: Buffer, isBinary: boolean) => {
      try {
        // Text messages are JSON commands (ws library always passes Buffer, use isBinary flag)
        if (!isBinary) {
          const msg = JSON.parse(data.toString('utf-8'));
          console.log(`   [${sessionId}] → client command: ${msg.type}`);
          if (msg.type === 'end_session') {
            endSession();
          }
          return;
        }

        // Don't forward audio if session is ending
        if (endingSession || sessionClosed) return;

        // Binary data = raw audio or video from browser
        if (data[0] === 0x01) {
          const imageData = data.subarray(1);
          session.sendRealtimeInput({
            video: {
              data: imageData.toString('base64'),
              mimeType: 'image/jpeg',
            },
          });
        } else {
          session.sendRealtimeInput({
            audio: {
              data: data.toString('base64'),
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }
      } catch (err) {
        if (!endingSession) {
          console.error(`   [${sessionId}] Error forwarding to Gemini:`, err);
        }
      }
    });

    // Handle WebSocket close
    ws.on('close', () => {
      console.log(`🔌 Client disconnected: ${sessionId}`);
      if (!sessionClosed) {
        try { session.close(); } catch (_) { /* already closed */ }
        sessionClosed = true;
      }
    });

    ws.on('error', (err) => {
      console.error(`   [${sessionId}] WebSocket error:`, err);
    });

    // End session function
    async function endSession() {
      if (endingSession) return;
      endingSession = true;

      const durationSeconds = Math.round((Date.now() - startedAt.getTime()) / 1000);
      console.log(`⏹️  Session ending: ${sessionId} (duration: ${durationSeconds}s, user entries: ${userTranscript.length}, ai entries: ${aiTranscript.length})`);

      // Close the Gemini session first
      if (!sessionClosed) {
        try {
          session.close();
        } catch (_) { /* already closed */ }
        sessionClosed = true;
      }

      // Generate post-session report
      try {
        console.log(`   [${sessionId}] Generating post-session report...`);
        const report = await generateReport(sessionId, mode, userTranscript, aiTranscript, metrics, durationSeconds);
        console.log(`   [${sessionId}] Report generated: overall_score=${report.overall_score}`);

        // Save session data
        await store.save({
          id: sessionId,
          mode,
          startedAt,
          transcript: [...userTranscript.map(t => `[User] ${t}`), ...aiTranscript.map(t => `[AI] ${t}`)],
          metrics,
          report,
        });

        // Send report to client
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'report', data: report }));
          console.log(`   [${sessionId}] ✅ Report sent to client`);
        } else {
          console.log(`   [${sessionId}] ⚠️ Client already disconnected, report not sent`);
        }
      } catch (err) {
        console.error(`   [${sessionId}] ❌ Error generating report:`, err);
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to generate report. Please try again.',
          }));
        }
      }
    }

  } catch (error) {
    console.error(`❌ Failed to initialize session ${sessionId}:`, error);
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to connect to AI. Check your API key.',
      }));
      ws.close();
    }
  }
}
