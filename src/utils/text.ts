/**
 * Text & readability utilities.
 *
 * Includes a Flesch Reading Ease implementation plus small helpers used by the
 * language / cognitive analyzers.
 */

export function wordCount(text: string): number {
  const words = text.trim().match(/[A-Za-z0-9'']+/g);
  return words ? words.length : 0;
}

export function sentenceCount(text: string): number {
  const sentences = text.trim().match(/[^.!?]+[.!?]+/g);
  const count = sentences ? sentences.length : 0;
  // A block of text with no terminal punctuation still counts as one sentence.
  return Math.max(count, text.trim().length > 0 ? 1 : 0);
}

/** Rough syllable estimate for English words. */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return w.length ? 1 : 0;
  const trimmed = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '');
  const matches = trimmed.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

export function syllableCount(text: string): number {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  return words.reduce((sum, w) => sum + countSyllables(w), 0);
}

export interface ReadabilityResult {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  words: number;
  sentences: number;
  avgWordsPerSentence: number;
  /** Human label: Very Easy … Very Difficult. */
  label: string;
}

export function readability(text: string): ReadabilityResult {
  const words = wordCount(text);
  const sentences = sentenceCount(text);
  const syllables = syllableCount(text);
  if (words === 0) {
    return {
      fleschReadingEase: 100,
      fleschKincaidGrade: 0,
      words: 0,
      sentences: 0,
      avgWordsPerSentence: 0,
      label: 'N/A',
    };
  }
  const wps = words / Math.max(sentences, 1);
  const spw = syllables / words;
  const ease = 206.835 - 1.015 * wps - 84.6 * spw;
  const grade = 0.39 * wps + 11.8 * spw - 15.59;
  return {
    fleschReadingEase: Math.round(ease * 10) / 10,
    fleschKincaidGrade: Math.max(0, Math.round(grade * 10) / 10),
    words,
    sentences,
    avgWordsPerSentence: Math.round(wps * 10) / 10,
    label: easeLabel(ease),
  };
}

function easeLabel(ease: number): string {
  if (ease >= 90) return 'Very Easy';
  if (ease >= 70) return 'Easy';
  if (ease >= 60) return 'Standard';
  if (ease >= 50) return 'Fairly Difficult';
  if (ease >= 30) return 'Difficult';
  return 'Very Difficult';
}

/** True when a string is composed only of emoji / symbols / whitespace. */
export function isEmojiOnly(text: string): boolean {
  const stripped = text.replace(/\s/g, '');
  if (!stripped) return false;
  // If removing emoji + punctuation leaves nothing, it's emoji/symbol only.
  const withoutEmoji = stripped.replace(
    /[\p{Extended_Pictographic}\p{Emoji_Presentation}\u200d\uFE0F]/gu,
    '',
  );
  return withoutEmoji.replace(/[^\p{L}\p{N}]/gu, '').length === 0;
}

export function truncate(text: string, max = 40): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}
