import { describe, expect, it } from 'vitest';
import { isEmojiOnly, readability, wordCount } from './text';

describe('text utils', () => {
  it('counts words', () => {
    expect(wordCount('the quick brown fox')).toBe(4);
    expect(wordCount('   ')).toBe(0);
  });

  it('rates simple text as easy to read', () => {
    const r = readability('The cat sat on the mat. The dog ran fast.');
    expect(r.fleschReadingEase).toBeGreaterThan(70);
    expect(r.fleschKincaidGrade).toBeLessThan(6);
  });

  it('rates complex text as harder to read', () => {
    const r = readability(
      'Notwithstanding the aforementioned considerations, the implementation necessitates comprehensive architectural reconfiguration.',
    );
    expect(r.fleschKincaidGrade).toBeGreaterThan(12);
  });

  it('detects emoji-only strings', () => {
    expect(isEmojiOnly('🎉🎊')).toBe(true);
    expect(isEmojiOnly('Hello 🎉')).toBe(false);
    expect(isEmojiOnly('Hello')).toBe(false);
  });
});
