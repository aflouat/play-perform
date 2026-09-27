import { READING_WORDS } from '@/lib/reading/reading-words';
import { parseSyllables } from '@/lib/reading/syllable-notation';

describe('READING_WORDS', () => {
  it.each(READING_WORDS.map((w) => [w.id, w] as const))('« %s » a une notation valide', (_id, w) => {
    expect(() => parseSyllables(w.text, w.say)).not.toThrow();
  });

  it('a des identifiants uniques', () => {
    const ids = READING_WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a au moins 3 mots par niveau (nécessaire pour « Lire et choisir »)', () => {
    for (const level of [1, 2, 3, 4]) {
      expect(READING_WORDS.filter((w) => w.level === level).length).toBeGreaterThanOrEqual(3);
    }
  });
});
