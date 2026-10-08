import { masteryPercent, buildingFor, summarizeReviews, paceToGoal } from '@/modules/skills';
import type { QuestionProgress } from '@/types';

const NOW = new Date('2026-10-08T10:00:00Z');
const prog = (id: string, over: Partial<QuestionProgress>): QuestionProgress => ({
  questionId: id, profileId: 'p', state: 'review', easeFactor: 2, interval: 3, repetitions: 1, correctCount: 1, wrongCount: 0,
  lastSeen: '2026-10-07T10:00:00Z', nextReview: '2026-10-10T10:00:00Z', ...over,
});

describe('mastery and buildings', () => {
  it('shows progress towards mastery (level 5)', () => {
    expect(masteryPercent(null)).toBe(0);
    expect(masteryPercent(1)).toBe(20);
    expect(masteryPercent(5)).toBe(100);
  });
  it('grows a building with the level', () => {
    const stages = [null, 1, 2, 3, 4, 5].map((l) => buildingFor(l as 1 | null).emoji);
    expect(new Set(stages).size).toBe(6);
    expect(buildingFor(5).label).toMatch(/château/i);
  });
});

describe('summarizeReviews', () => {
  it('is empty when nothing has been studied', () => {
    expect(summarizeReviews({}, NOW)).toEqual({ studied: 0, lastStudiedAt: null, dueNow: 0, nextReviewAt: null, upcoming: [] });
  });

  it('counts studied, due and upcoming reviews', () => {
    const map = {
      a: prog('a', { nextReview: '2026-10-08T08:00:00Z' }),
      b: prog('b', { nextReview: '2026-10-10T10:00:00Z' }),
      c: prog('c', { nextReview: '2026-10-10T18:00:00Z' }),
      d: prog('d', { nextReview: '2026-10-20T10:00:00Z', lastSeen: '2026-10-06T10:00:00Z' }),
      e: prog('e', { state: 'new', lastSeen: null, nextReview: null }),
    };
    const s = summarizeReviews(map, NOW);
    expect(s.studied).toBe(4);
    expect(s.dueNow).toBe(1);
    expect(s.lastStudiedAt).toBe('2026-10-07T10:00:00Z');
    expect(s.nextReviewAt).toBe('2026-10-10T10:00:00Z');
    expect(s.upcoming).toEqual([{ day: '2026-10-10', count: 2 }, { day: '2026-10-20', count: 1 }]);
  });
});

describe('paceToGoal', () => {
  it('has no verdict without a goal date', () => {
    expect(paceToGoal(2, null, NOW)).toEqual({ status: 'no-goal', levelsLeft: 3, daysLeft: null, daysPerLevel: null });
  });
  it('is achieved at level 5', () => {
    expect(paceToGoal(5, '2026-12-01', NOW).status).toBe('achieved');
  });
  it('gives the pace needed to reach level 5 by the date', () => {
    expect(paceToGoal(3, '2026-10-18', NOW)).toEqual({ status: 'on-track', levelsLeft: 2, daysLeft: 10, daysPerLevel: 5 });
  });
  it('is late when the date is past or less than a day per level remains', () => {
    expect(paceToGoal(1, '2026-10-08', NOW).status).toBe('late');
    expect(paceToGoal(1, '2026-10-01', NOW).status).toBe('late');
    expect(paceToGoal(1, '2026-10-10', NOW).status).toBe('late');
  });
});
