import type { WebSocket } from 'ws';
import type { MetricSnapshot } from '../store.js';

// ─── Client → Server binary message parsing ──────────────────────────────────

export interface AudioPayload {
  type: 'audio';
  data: Buffer;
}

export interface VideoPayload {
  type: 'video';
  data: Buffer;
}

export type BinaryPayload = AudioPayload | VideoPayload;

/**
 * Parse a binary message from the client.
 * Format: `{"type":"audio"|"video"}\n<raw bytes>`
 */
export function parseBinaryMessage(data: Buffer): BinaryPayload | null {
  const newlineIdx = data.indexOf(10); // \n
  if (newlineIdx === -1) return null;

  const headerBytes = data.subarray(0, newlineIdx);
  const rawData = data.subarray(newlineIdx + 1);

  let header: { type: string };
  try {
    header = JSON.parse(headerBytes.toString('utf-8'));
  } catch {
    return null;
  }

  if (header.type === 'audio' || header.type === 'video') {
    return { type: header.type, data: rawData };
  }
  return null;
}

// ─── Server → Client message helpers ─────────────────────────────────────────

function safeSend(ws: WebSocket, data: string | Buffer): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(data);
  }
}

export function sendJSON(ws: WebSocket, payload: Record<string, unknown>): void {
  safeSend(ws, JSON.stringify(payload));
}

export function sendSessionStarted(ws: WebSocket, sessionId: string, mode: string): void {
  sendJSON(ws, { type: 'session_started', sessionId, mode });
}

export function sendTranscriptCue(ws: WebSocket, text: string, timestamp: number): void {
  sendJSON(ws, { type: 'transcript_cue', text, timestamp });
}

export function sendMetrics(ws: WebSocket, data: MetricSnapshot): void {
  sendJSON(ws, { type: 'metrics', data });
}

export function sendTurnComplete(ws: WebSocket): void {
  sendJSON(ws, { type: 'turn_complete' });
}

export function sendInterrupted(ws: WebSocket): void {
  sendJSON(ws, { type: 'interrupted' });
}

export function sendError(ws: WebSocket, message: string): void {
  sendJSON(ws, { type: 'error', message });
}

export function sendReport(ws: WebSocket, data: unknown): void {
  sendJSON(ws, { type: 'report', data });
}

export function sendAiDisconnected(ws: WebSocket, message: string): void {
  sendJSON(ws, { type: 'ai_disconnected', message });
}

export function sendAudioChunk(ws: WebSocket, base64Data: string): void {
  const audioBuffer = Buffer.from(base64Data, 'base64');
  safeSend(ws, audioBuffer);
}

export function isWsOpen(ws: WebSocket): boolean {
  return ws.readyState === ws.OPEN;
}
