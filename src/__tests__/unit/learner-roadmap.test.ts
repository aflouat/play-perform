import {
  addDays, buildRoadmap, courseHref, courseState, newlyCompleted, plannedDates, resumeTarget, type RoadmapPhase,
} from '@/modules/dashboards/domain/roadmap';
import { latestBadges, rankProgress, trapAlerts } from '@/modules/dashboards/domain/scorecard';
import type { Badge } from '@/types';

const PHASES: RoadmapPhase[] = [
  { id: 'p1', title: 'Fondations', weeks: 2, courses: [{ skillId: 'methode', targetLevel: 2 }, { skillId: 'logique', targetLevel: 1 }] },
  { id: 'p2', title: 'Bases', weeks: 3, courses: [
    { skillId: 'maths', targetLevel: 2, requires: { skillId: 'logique', level: 2 } },
    { skillId: 'francais', targetLevel: 2 },
  ] },
  { id: 'p3', title: 'Consolidation', weeks: 1, courses: [{ skillId: 'maths', targetLevel: 3 }] },
];
const START = { startedAt: '2026-10-01', completedAt: {} };
const withQuiz = () => true;

describe('course state (level filter)', () => {
  it('is done once the target level is reached, blocked while the required level is missing', () => {
    const maths = PHASES[1].courses[0];
    expect(courseState(maths, { maths: 2 })).toBe('done');
    expect(courseState(maths, { logique: 1 })).toBe('needs-level');
    expect(courseState(maths, { logique: 2 })).toBe('ready');
    expect(courseState(PHASES[1].courses[1], {})).toBe('ready');
  });
});

describe('planning', () => {
  it('chains the target dates from the start date', () => {
    expect(addDays('2026-10-01', 14)).toBe('2026-10-15');
    expect(plannedDates(PHASES, '2026-10-01')).toEqual(['2026-10-15', '2026-11-05', '2026-11-12']);
  });
});

describe('phase lock', () => {
  it('the first unfinished phase is current, the next ones are locked', () => {
    const views = buildRoadmap(PHASES, { methode: 2 }, START, '2026-10-05');
    expect(views.map((v) => v.status)).toEqual(['current', 'locked', 'locked']);
    expect(views[0]).toMatchObject({ number: 1, done: 1, total: 2, plannedDate: '2026-10-15', late: false });
  });

  it('keeps a phase locked while the previous one is not complete, even if its own courses are done', () => {
    const views = buildRoadmap(PHASES, { methode: 1, maths: 3, francais: 2 }, START, '2026-10-05');
    expect(views.map((v) => v.status)).toEqual(['current', 'locked', 'locked']);
  });

  it('unlocks the next phase once the previous one is complete', () => {
    const views = buildRoadmap(PHASES, { methode: 2, logique: 1 }, START, '2026-10-05');
    expect(views.map((v) => v.status)).toEqual(['done', 'current', 'locked']);
    expect(views[1].courses.map((c) => c.state)).toEqual(['needs-level', 'ready']);
  });

  it('flags the current phase as late after its target date, and a phase completed after it', () => {
    const progress = { startedAt: '2026-10-01', completedAt: { p1: '2026-10-20' } };
    const views = buildRoadmap(PHASES, { methode: 2, logique: 1 }, progress, '2026-11-08');
    expect(views[0]).toMatchObject({ completedAt: '2026-10-20', late: true, daysLate: 5 });
    expect(views[1]).toMatchObject({ late: true, daysLate: 3 });
    expect(views[2]).toMatchObject({ late: false });
  });

  it('records the completion day of newly finished phases only', () => {
    const views = buildRoadmap(PHASES, { methode: 2, logique: 2, maths: 2, francais: 2 }, { startedAt: '2026-10-01', completedAt: { p1: '2026-10-09' } }, '2026-10-12');
    expect(newlyCompleted(views, '2026-10-12')).toEqual({ p2: '2026-10-12' });
  });
});

describe('resume (where the learner stopped)', () => {
  it('goes to the next course of the current phase', () => {
    const views = buildRoadmap(PHASES, { methode: 2 }, START, '2026-10-05');
    expect(resumeTarget(views, null, withQuiz)).toEqual({ kind: 'course', skillId: 'logique', level: 1, href: '/competences/logique?activity=quiz' });
  });

  it('prefers the last skill worked on when it is still to do in the current phase', () => {
    const views = buildRoadmap(PHASES, {}, START, '2026-10-05');
    expect(resumeTarget(views, 'logique', withQuiz)).toMatchObject({ skillId: 'logique' });
    expect(resumeTarget(views, 'maths', withQuiz)).toMatchObject({ skillId: 'methode' });
  });

  it('suggests the catch-up course when the required level is missing', () => {
    const views = buildRoadmap(PHASES, { methode: 2, logique: 1 }, START, '2026-10-05');
    expect(resumeTarget(views, null, withQuiz)).toEqual({
      kind: 'remediation', skillId: 'logique', level: 2, forSkillId: 'maths', href: '/competences/logique?activity=quiz',
    });
  });

  it('opens the skill page instead of a quiz when the skill has no question bank', () => {
    const views = buildRoadmap(PHASES, { methode: 2 }, START, '2026-10-05');
    expect(resumeTarget(views, null, () => false).href).toBe('/competences/logique');
    expect(courseHref('maths-fractions')).toBe('/competences/maths-fractions?activity=quiz');
    expect(courseHref('logique')).toBe('/competences/logique');
  });

  it('congratulates when the whole roadmap is done', () => {
    const views = buildRoadmap(PHASES, { methode: 2, logique: 2, maths: 3, francais: 2 }, START, '2026-10-05');
    expect(resumeTarget(views, null, withQuiz)).toMatchObject({ kind: 'finished', href: '/competences' });
  });
});

describe('scorecard', () => {
  it('shows the progress towards the next rank', () => {
    expect(rankProgress(250)).toEqual({ rank: 3, xpInRank: 50, xpPerRank: 100, percent: 50 });
    expect(rankProgress(0)).toEqual({ rank: 1, xpInRank: 0, xpPerRank: 100, percent: 0 });
  });

  it('keeps the 3 latest unlocked badges, newest first', () => {
    const badge = (id: Badge['id'], day: number | null): Badge => ({ id, name: id, emoji: '⭐', description: '', unlockedAt: day ? new Date(2026, 9, day) : null });
    const badges = [badge('first-quiz', 1), badge('streak-3', 4), badge('fast-learner', null), badge('perfect-quiz', 3), badge('streak-7', 8)];
    expect(latestBadges(badges).map((b) => b.id)).toEqual(['streak-7', 'streak-3', 'perfect-quiz']);
  });

  it('turns classic traps into anonymous alerts with the exact number of learners who went wrong', () => {
    const question = { id: 'q1', question: 'La corrélation', correctOptionId: 'A', explanation: '', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }] };
    const alerts = trapAlerts([question], { q1: { A: 8, B: 12 } }, 'maths');
    expect(alerts).toEqual([{ questionId: 'q1', question: 'La corrélation', wrong: 12, skillId: 'maths' }]);
    expect(trapAlerts([question], { q1: { A: 3, B: 2 } }, 'maths')).toEqual([]); // too few answers: nothing shared
  });
});
