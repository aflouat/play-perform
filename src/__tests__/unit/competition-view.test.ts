import { buildCompetitionView, type CompetitionData } from '@/modules/competition';

const NOW = new Date(2026, 9, 8); // 2026-W41
const base: CompetitionData = {
  students: [
    { id: 'a', nickname: 'RenardBleu1' }, { id: 'b', nickname: 'LynxMalin2' }, { id: 'c', nickname: 'PandaZen3' },
  ],
  scores: [{ profile_id: 'a', xp: 100, streak: 4 }, { profile_id: 'b', xp: 300, streak: 1 }],
  levelSums: { a: 3, b: 5 },
  results: [
    { profile_id: 'a', week: '2026-W41', correct: 5, total: 5, duration_ms: 20_000 },
    { profile_id: 'b', week: '2026-W41', correct: 4, total: 5, duration_ms: 10_000 },
    { profile_id: 'a', week: '2026-W40', correct: 3, total: 5, duration_ms: 30_000 },
    { profile_id: 'c', week: '2026-W40', correct: 5, total: 5, duration_ms: 50_000 },
    { profile_id: 'b', week: '2026-W40', correct: 5, total: 5, duration_ms: 40_000 },
  ],
  revocations: [],
};

describe('buildCompetitionView', () => {
  it('ranks the centre by the chosen metric, never exposing anything but pseudonyms', () => {
    const view = buildCompetitionView(base, 'a', 'xp', NOW);
    expect(view.board.map((r) => [r.nickname, r.rank])).toEqual([['LynxMalin2', 1], ['RenardBleu1', 2], ['PandaZen3', 3]]);
    expect(view.board.find((r) => r.isMe)?.nickname).toBe('RenardBleu1');
    expect(JSON.stringify(view)).not.toMatch(/"id"|profile_id|profileId/);
  });

  it('treats a student without score as zero', () => {
    const view = buildCompetitionView(base, 'a', 'streak', NOW);
    expect(view.board.map((r) => r.nickname)).toEqual(['RenardBleu1', 'LynxMalin2', 'PandaZen3']);
    expect(view.board[2]).toMatchObject({ xp: 0, streak: 0, levels: 0 });
  });

  it('gives the weekly board and my own result for the current week', () => {
    const view = buildCompetitionView(base, 'a', 'xp', NOW);
    expect(view.week).toBe('2026-W41');
    expect(view.weekly.map((r) => [r.nickname, r.rank])).toEqual([['RenardBleu1', 1], ['LynxMalin2', 2]]);
    expect(view.myResult).toEqual({ correct: 5, total: 5 });
    expect(buildCompetitionView(base, 'c', 'xp', NOW).myResult).toBeNull();
  });

  it('awards last weeks’ medals automatically and lists mine', () => {
    const view = buildCompetitionView(base, 'b', 'xp', NOW);
    const lastWeek = view.pastAwards.find((p) => p.week === '2026-W40');
    expect(lastWeek?.awards.map((a) => [a.nickname, a.medal])).toEqual([['LynxMalin2', '🥇'], ['PandaZen3', '🥈'], ['RenardBleu1', '🥉']]);
    expect(view.myTrophies).toEqual([{ week: '2026-W40', medal: '🥇' }]);
  });

  it('removes an award the teacher revoked', () => {
    const view = buildCompetitionView({ ...base, revocations: [{ profile_id: 'b', week: '2026-W40' }] }, 'b', 'xp', NOW);
    expect(view.myTrophies).toEqual([]);
    expect(view.pastAwards.find((p) => p.week === '2026-W40')?.awards.map((a) => a.nickname)).toEqual(['PandaZen3', 'RenardBleu1']);
  });
});
