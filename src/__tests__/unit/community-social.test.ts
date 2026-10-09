import {
  pairsFor, groupOf, bonusStatus, BONUS_XP, MENTION_MIN_CORRECT, describeEvent, canCheer, buildPairView, type PairData,
} from '@/modules/competition';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `s${i + 1}`);
const pairKeys = (groups: string[][]) => groups.flatMap((g) => g.flatMap((a, i) => g.slice(i + 1).map((b) => [a, b].sort().join('+'))));

describe('pairsFor (random pairs of the week)', () => {
  it('puts everyone in exactly one group of two, and an odd one out in a trio', () => {
    for (const n of [2, 4, 7, 10]) {
      const groups = pairsFor('centre-a:2026-W41', ids(n));
      expect(groups.flat().sort()).toEqual(ids(n).sort());
      groups.forEach((g, i) => expect(g.length).toBe(n % 2 === 1 && i === groups.length - 1 ? 3 : 2));
    }
  });

  it('is the same for everyone who computes it, and independent of the order of the list', () => {
    const a = pairsFor('centre-a:2026-W41', ids(8));
    expect(pairsFor('centre-a:2026-W41', ids(8))).toEqual(a);
    expect(pairsFor('centre-a:2026-W41', [...ids(8)].reverse())).toEqual(a);
  });

  it('changes from one week to the next, avoiding last week’s partners when possible', () => {
    const last = pairsFor('centre-a:2026-W40', ids(8));
    const next = pairsFor('centre-a:2026-W41', ids(8), last);
    expect(next).not.toEqual(last);
    const before = new Set(pairKeys(last));
    expect(pairKeys(next).filter((k) => before.has(k))).toEqual([]);
  });

  it('pairs nobody when there is only one learner', () => {
    expect(pairsFor('k', ['s1'])).toEqual([]);
    expect(pairsFor('k', [])).toEqual([]);
  });

  it('finds the group of a learner', () => {
    const groups = pairsFor('k', ids(4));
    expect(groupOf(groups, 's3')).toContain('s3');
    expect(groupOf(groups, 'ghost')).toBeNull();
  });
});

describe('bonusStatus (both get the mention, both win)', () => {
  const group = ['me', 'friend'];
  const mention = { correct: MENTION_MIN_CORRECT, total: 5 };
  const weak = { correct: MENTION_MIN_CORRECT - 1, total: 5 };

  it('is won only when every member of the group got the mention', () => {
    expect(bonusStatus(group, { me: mention, friend: mention }, false).status).toBe('won');
    expect(BONUS_XP).toBeGreaterThan(0);
  });
  it('waits while the week runs and someone has not played or fell short', () => {
    expect(bonusStatus(group, { me: mention }, false).status).toBe('waiting');
    expect(bonusStatus(group, { me: mention, friend: weak }, false).status).toBe('waiting');
  });
  it('is missed once the week is over without both mentions', () => {
    expect(bonusStatus(group, { me: mention, friend: weak }, true).status).toBe('missed');
    expect(bonusStatus(group, {}, true).status).toBe('missed');
  });
  it('reports who played and who got the mention', () => {
    expect(bonusStatus(group, { me: mention, friend: weak }, false).members).toEqual([
      { id: 'me', played: true, mention: true }, { id: 'friend', played: true, mention: false }]);
  });
});

describe('buildPairView', () => {
  const NOW = new Date(2026, 9, 8); // 2026-W41
  const students = ids(4).map((id) => ({ id, nickname: `Pseudo_${id}` }));
  const data = (over: Partial<PairData> = {}): PairData => ({ organizationId: 'centre-a', students, results: [], claimed: false, ...over });

  it('names my partners by pseudonym only', () => {
    const view = buildPairView(data(), 's1', NOW);
    expect(view?.partners).toHaveLength(1);
    expect(view?.partners[0].nickname).toMatch(/^Pseudo_s[2-4]$/);
    expect(JSON.stringify(view)).not.toMatch(/"id"|profile/);
  });

  it('lets the pair claim the bonus once, when both got the mention', () => {
    const partner = groupOf(pairsFor('centre-a:2026-W41', ids(4), pairsFor('centre-a:2026-W40', ids(4))), 's1')?.find((x) => x !== 's1') as string;
    const results = [{ profile_id: 's1', week: '2026-W41', correct: 5, total: 5 }, { profile_id: partner, week: '2026-W41', correct: 4, total: 5 }];
    expect(buildPairView(data({ results }), 's1', NOW)).toMatchObject({ status: 'won', claimable: true, bonusXp: BONUS_XP });
    expect(buildPairView(data({ results, claimed: true }), 's1', NOW)).toMatchObject({ status: 'won', claimable: false, claimed: true });
  });

  it('has no pair for a learner who is alone in the centre', () => {
    expect(buildPairView(data({ students: [students[0]] }), 's1', NOW)).toBeNull();
  });
});

describe('feed', () => {
  it('announces a mastery with the pseudonym and the skill, never a real name', () => {
    expect(describeEvent({ nickname: 'RenardBleu1', skillName: 'Logique', skillEmoji: '🧩', level: 5 })).toBe('🚀 RenardBleu1 vient de maîtriser 🧩 Logique (niveau 5) ! Bravo !');
    expect(describeEvent({ nickname: 'RenardBleu1', skillName: 'Logique', skillEmoji: '🧩', level: 4 })).toContain('niveau 4');
  });
  it('lets you cheer a friend once, not yourself', () => {
    expect(canCheer({ profileId: 'a' }, 'b', false)).toBe(true);
    expect(canCheer({ profileId: 'a' }, 'a', false)).toBe(false);
    expect(canCheer({ profileId: 'a' }, 'b', true)).toBe(false);
  });
});
