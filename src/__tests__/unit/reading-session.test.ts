import { buildReadingSession } from '@/lib/reading/reading-session';

describe('buildReadingSession', () => {
  it('construit une session de mots uniques du niveau demandé', () => {
    const session = buildReadingSession(2, 6);
    expect(session).toHaveLength(6);
    expect(new Set(session.map((c) => c.target.id)).size).toBe(6);
    expect(session.every((c) => c.target.level === 2)).toBe(true);
  });

  it('propose 3 images distinctes dont la bonne, du même niveau', () => {
    for (const challenge of buildReadingSession(4, 6)) {
      const ids = challenge.options.map((o) => o.id);
      expect(ids).toHaveLength(3);
      expect(new Set(ids).size).toBe(3);
      expect(ids).toContain(challenge.target.id);
      expect(challenge.options.every((o) => o.level === 4)).toBe(true);
    }
  });

  it('limite la session au nombre de mots disponibles', () => {
    expect(buildReadingSession(1, 500).length).toBeLessThanOrEqual(10);
  });

  it('est déterministe avec un générateur aléatoire fixé', () => {
    const fixed = () => 0.42;
    const a = buildReadingSession(3, 4, fixed).map((c) => c.target.id);
    const b = buildReadingSession(3, 4, fixed).map((c) => c.target.id);
    expect(a).toEqual(b);
  });
});
