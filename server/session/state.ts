import type { GoogleGenAI } from '@google/genai';
import type { Mode } from '../config.js';
import type { MetricSnapshot, SessionStore } from '../store.js';
import type { TranscriptEntry } from '../report.js';
import { TranscriptBuffer } from './transcript-buffer.js';
import { ToneAnalyzer } from './tone-analyzer.js';
import { config } from '../config.js';
import { randomUUID } from 'crypto';

export type SessionStatus = 'connecting' | 'active' | 'ending' | 'closed';

export interface SessionState {
  readonly id: string;
  readonly mode: Mode;
  readonly userId: string;
  readonly startedAt: Date;
  voiceName: string;
  systemPrompt: string;
  status: SessionStatus;
  transcript: TranscriptEntry[];
  metrics: MetricSnapshot[];
  userBuffer: TranscriptBuffer;
  aiBuffer: TranscriptBuffer;
  toneAnalyzer: ToneAnalyzer;
  audioChunkCount: number;
}

export function createSessionState(
  mode: Mode,
  userId: string,
  systemPrompt: string,
  genai: GoogleGenAI,
): SessionState {
  const id = randomUUID();
  const voiceName = config.voices[Math.floor(Math.random() * config.voices.length)];

  return {
    id,
    mode,
    userId,
    startedAt: new Date(),
    voiceName,
    systemPrompt,
    status: 'connecting',
    transcript: [],
    metrics: [],
    userBuffer: new TranscriptBuffer('user'),
    aiBuffer: new TranscriptBuffer('ai'),
    toneAnalyzer: new ToneAnalyzer(genai, id),
    audioChunkCount: 0,
  };
}

export function getElapsedSeconds(state: SessionState): number {
  return Math.round((Date.now() - state.startedAt.getTime()) / 1000);
}

export function getAllTextByRole(state: SessionState, role: 'user' | 'ai'): string {
  return state.transcript.filter(t => t.role === role).map(t => t.text).join(' ');
}
