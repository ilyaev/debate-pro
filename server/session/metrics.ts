import type { Mode } from '../config.js';
import type { MetricSnapshot } from '../store.js';
import { FILLER_WORDS } from './constants.js';

export function extractMetrics(
  userText: string,
  aiText: string,
  elapsedSeconds: number,
  mode: Mode,
  tone: string,
  llmHint: string = ''
): MetricSnapshot {
  const lower = userText.toLowerCase();
  const fillerCounts: Record<string, number> = {};
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      fillerCounts[filler] = matches.length;
    }
  }

  const userWords = userText.split(/\s+/).filter(w => w.length > 0).length;
  const aiWords = aiText.split(/\s+/).filter(w => w.length > 0).length;
  const totalWords = Math.max(userWords + aiWords, 1);
  const talk_ratio = Math.round((userWords / totalWords) * 100);

  const uniqueWords = new Set(lower.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0));
  const clarity_score = userWords > 0 ? Math.min(Math.round((uniqueWords.size / userWords) * 100), 100) : 100;

  const minutes = Math.max(elapsedSeconds / 60, 0.1);
  const wpm = Math.round(userWords / minutes);

  // Dynamic hints: prefer LLM hint, fallback to heuristics
  let hint = llmHint;
  if (!hint) {
    if (mode === 'pitch_perfect' && wpm > 180) {
      hint = 'You are speaking very fast. Take a breath and slow down.';
    } else if (mode === 'empathy_trainer' && talk_ratio > 65) {
      hint = 'Try to listen more. Let the other person speak.';
    } else if (Object.keys(fillerCounts).length > 0) {
      hint = `Try reducing filler words like "${Object.keys(fillerCounts)[0]}"`;
    } else if (mode === 'veritalk' && !userText.includes('?')) {
      hint = 'Try flipping the defense: ask them a clarifying question.';
    }
  }

  return {
    filler_words: fillerCounts,
    words_per_minute: wpm,
    tone,
    key_phrases: [],
    improvement_hint: hint,
    timestamp: Date.now(),
    talk_ratio,
    clarity_score
  };
}
