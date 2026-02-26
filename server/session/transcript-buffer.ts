import { USER_FLUSH_WORD_THRESHOLD, AI_FLUSH_WORD_THRESHOLD } from './constants.js';

export interface FlushResult {
  text: string;
  flushed: boolean;
}

export class TranscriptBuffer {
  private buffer = '';
  private wordThreshold: number;
  private sentencePattern: RegExp;

  constructor(role: 'user' | 'ai') {
    if (role === 'user') {
      this.wordThreshold = USER_FLUSH_WORD_THRESHOLD;
      this.sentencePattern = /[.?!]$/;
    } else {
      this.wordThreshold = AI_FLUSH_WORD_THRESHOLD;
      this.sentencePattern = /[.?!:"]$/;
    }
  }

  append(text: string): void {
    this.buffer += text;
  }

  /** Check if the buffer should be flushed. Returns the text if ready, null otherwise. */
  tryFlush(): string | null {
    const trimmed = this.buffer.trim();
    if (!trimmed) return null;

    const isSentenceEnd = this.sentencePattern.test(trimmed);
    const wordCount = trimmed.split(/\s+/).length;

    if (isSentenceEnd || wordCount >= this.wordThreshold) {
      this.buffer = '';
      return trimmed;
    }
    return null;
  }

  /** Force flush whatever is left, even if it doesn't meet thresholds. */
  forceFlush(): string | null {
    const trimmed = this.buffer.trim();
    if (!trimmed) return null;
    this.buffer = '';
    return trimmed;
  }

  peek(): string {
    return this.buffer.trim();
  }
}
