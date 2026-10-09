import {
  isoWeek, previousWeek, validateNickname, generateNickname, rankBy, rankWeekly, awardsFor, challengeFor, scoreChallenge,
  CHALLENGE_LENGTH, type WeeklyResult,
} from '@/modules/competition';

describe('isoWeek', () => {
  it('names the ISO week of a date', () => {
    expect(isoWeek(new Date(2026, 9, 8))).toBe('2026-W41'); // Thursday 8 Oct 2026
    expect(isoWeek(new Date(2026, 0, 1))).toBe('2026-W01'); // Thursday
    expect(isoWeek(new Date(2024, 11, 30))).toBe('2025-W01'); // Monday of the first ISO week of 2025
    expect(isoWeek(new Date(2021, 0, 3))).toBe('2020-W53'); // Sunday, last ISO week of 2020
  });
  it('gives the previous week, across years', () => {
    expect(previousWeek('2026-W41')).toBe('2026-W40');
    expect(previousWeek('2026-W01')).toBe('2025-W52');
    expect(previousWeek('2021-W01')).toBe('2020-W53');
  });
});

describe('nicknames', () => {
  it('accepts 3-20 safe characters and rejects the rest', () => {
    expect(validateNickname(' Renard_Bleu42 ')).toEqual({ ok: true, value: 'Renard_Bleu42' });
    expect(validateNickname('ab').ok).toBe(false);
    expect(validateNickname('x'.repeat(21)).ok).toBe(false);
    expect(validateNickname('Jean Dupont').ok).toBe(false); // spaces: avoids real "first name last name"
    expect(validateNickname('<script>').ok).toBe(false);
  });
  it('generates a valid pseudonym, deterministic for a seed', () => {
    const a = generateNickname('seed-1');
    expect(validateNickname(a).ok).toBe(true);
    expect(generateNickname('seed-1')).toBe(a);
    expect(generateNickname('seed-2')).not.toBe(a);
  });
});

describe('rankBy', () => {
  const rows = [
    { id: 'a', nickname: 'A', xp: 300, streak: 2, levels: 4 },
    { id: 'b', nickname: 'B', xp: 500, streak: 9, levels: 7 },
    { id: 'c', nickname: 'C', xp: 300, streak: 5, levels: 2 },
  ];
  it('sorts by the metric and shares the rank on ties (1, 2, 2…)', () => {
    expect(rankBy(rows, 'xp').map((r) => [r.id, r.rank])).toEqual([['b', 1], ['a', 2], ['c', 2]]);
    expect(rankBy(rows, 'streak').map((r) => r.id)).toEqual(['b', 'c', 'a']);
    expect(rankBy(rows, 'levels').map((r) => r.id)).toEqual(['b', 'a', 'c']);
  });
});

describe('weekly ranking and awards', () => {
  const results: WeeklyResult[] = [
    { profileId: 'a', nickname: 'A', correct: 5, total: 5, durationMs: 40_000 },
    { profileId: 'b', nickname: 'B', correct: 5, total: 5, durationMs: 30_000 },
    { profileId: 'c', nickname: 'C', correct: 4, total: 5, durationMs: 10_000 },
    { profileId: 'd', nickname: 'D', correct: 2, total: 5, durationMs: 5_000 },
    { profileId: 'e', nickname: 'E', correct: 3, total: 5, durationMs: 50_000 },
  ];
  it('ranks by correct answers, then by speed', () => {
    expect(rankWeekly(results).map((r) => r.profileId)).toEqual(['b', 'a', 'c', 'e', 'd']);
  });
  it('awards medals to the top 3 with at least 3 correct answers', () => {
    expect(awardsFor(results, new Set()).map((a) => [a.profileId, a.medal])).toEqual([['b', '🥇'], ['a', '🥈'], ['c', '🥉']]);
  });
  it('drops a revoked award without promoting anyone else', () => {
    expect(awardsFor(results, new Set(['b'])).map((a) => a.profileId)).toEqual(['a', 'c']);
  });
  it('gives no award for weak scores', () => {
    expect(awardsFor([results[3]], new Set())).toEqual([]);
  });
});

describe('weekly challenge', () => {
  it('is the same for everyone in a week and differs between weeks', () => {
    const a = challengeFor('2026-W41');
    expect(challengeFor('2026-W41')).toEqual(a);
    expect(a.questions).toHaveLength(CHALLENGE_LENGTH);
    expect(new Set(a.questions.map((q) => q.id)).size).toBe(CHALLENGE_LENGTH);
    const others = ['2026-W42', '2026-W43', '2026-W44', '2026-W45'].map((w) => challengeFor(w).questions.map((q) => q.id).join());
    expect(others.some((ids) => ids !== a.questions.map((q) => q.id).join())).toBe(true);
  });
  it('scores answers against the real questions (the client is not trusted)', () => {
    const { questions } = challengeFor('2026-W41');
    const right = questions.map((q) => ({ questionId: q.id, optionId: q.correctOptionId }));
    expect(scoreChallenge(questions, right)).toEqual({ correct: CHALLENGE_LENGTH, total: CHALLENGE_LENGTH });
    const wrong = right.map((a, i) => (i === 0 ? { ...a, optionId: a.optionId === 'A' ? 'B' : 'A' } : a));
    expect(scoreChallenge(questions, wrong).correct).toBe(CHALLENGE_LENGTH - 1);
    expect(scoreChallenge(questions, [...right, right[0]]).correct).toBe(CHALLENGE_LENGTH); // duplicates ignored
    expect(scoreChallenge(questions, []).correct).toBe(0);
  });
});
