import { parseSyllables } from '@/lib/reading/syllable-notation';

describe('parseSyllables', () => {
  it('découpe les syllabes séparées par des tirets', () => {
    const parsed = parseSyllables('É-co-le');
    expect(parsed.word).toBe('École');
    expect(parsed.syllables.map((s) => s.spoken)).toEqual(['É', 'co', 'le']);
    expect(parsed.syllables.every((s) => s.segments.every((seg) => !seg.silent))).toBe(true);
  });

  it('marque les lettres entre parenthèses comme muettes', () => {
    const parsed = parseSyllables('blan(c)');
    expect(parsed.word).toBe('blanc');
    expect(parsed.syllables).toHaveLength(1);
    expect(parsed.syllables[0].segments).toEqual([
      { text: 'blan', silent: false },
      { text: 'c', silent: true },
    ]);
    expect(parsed.syllables[0].spoken).toBe('blan');
  });

  it('gère plusieurs lettres muettes en fin de mot', () => {
    const parsed = parseSyllables('pa-ren(ts)');
    expect(parsed.word).toBe('parents');
    expect(parsed.syllables[1].segments).toEqual([
      { text: 'ren', silent: false },
      { text: 'ts', silent: true },
    ]);
  });

  it('gère une lettre muette en début de syllabe', () => {
    const parsed = parseSyllables('(h)i-ver');
    expect(parsed.word).toBe('hiver');
    expect(parsed.syllables[0].segments).toEqual([
      { text: 'h', silent: true },
      { text: 'i', silent: false },
    ]);
    expect(parsed.syllables[0].spoken).toBe('i');
  });

  it('alterne les couleurs uniquement sur les syllabes prononcées', () => {
    const parsed = parseSyllables('to-ma-te');
    expect(parsed.syllables.map((s) => s.colorIndex)).toEqual([0, 1, 0]);
  });

  it('utilise la prononciation fournie pour la synthèse vocale', () => {
    const parsed = parseSyllables('oi-seau', ['wa', 'zo']);
    expect(parsed.syllables.map((s) => s.spoken)).toEqual(['wa', 'zo']);
  });

  it('refuse une prononciation qui ne correspond pas au nombre de syllabes', () => {
    expect(() => parseSyllables('oi-seau', ['wazo'])).toThrow();
  });

  it.each(['', 'a--b', '-ma', 'ma-', 'blan(c', 'bla)n', 'bl(a(n)c)', '()ma', '(ma)'])(
    'refuse la notation invalide « %s »',
    (notation) => {
      expect(() => parseSyllables(notation)).toThrow();
    },
  );
});
