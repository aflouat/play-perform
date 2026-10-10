import {
  buildCentreDashboard, buildExaminerDashboard, nextActionsFor, activityStatus,
  type StudentRow, type LearnerSnapshot,
} from '@/modules/dashboards';

const NOW = new Date('2026-10-12T10:00:00Z'); // Monday
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

describe('activityStatus', () => {
  it('classifies students by their last activity', () => {
    expect(activityStatus(daysAgo(2), NOW)).toBe('active');
    expect(activityStatus(daysAgo(7), NOW)).toBe('active');
    expect(activityStatus(daysAgo(10), NOW)).toBe('idle');
    expect(activityStatus(daysAgo(40), NOW)).toBe('dormant');
    expect(activityStatus(null, NOW)).toBe('dormant');
  });
});

describe('buildCentreDashboard', () => {
  const student = (id: string, over: Partial<StudentRow> = {}): StudentRow => ({
    id, name: id, emoji: '🙂', grade: '6e', xp: 0, streak: 0, lastActivityAt: null, levelsTotal: 0, skillsStarted: 0, ...over,
  });
  const students = [
    student('Ana', { lastActivityAt: daysAgo(1), xp: 300, streak: 5, levelsTotal: 6, skillsStarted: 3 }),
    student('Ben', { lastActivityAt: daysAgo(12), xp: 80, levelsTotal: 2, skillsStarted: 1 }),
    student('Cléo'),
  ];
  const dash = buildCentreDashboard({ students, newEnrollments: 3, pendingEvaluations: 2, challengePlayers: 1 }, NOW);

  it('counts the centre’s students and who worked this week', () => {
    expect(dash).toMatchObject({ totalStudents: 3, activeThisWeek: 1, newEnrollments: 3, pendingEvaluations: 2, challengePlayers: 1 });
  });
  it('puts students who need attention first: never started, then idle, then active', () => {
    expect(dash.students.map((s) => [s.name, s.status])).toEqual([['Cléo', 'dormant'], ['Ben', 'idle'], ['Ana', 'active']]);
    expect(dash.needAttention.map((s) => s.name)).toEqual(['Cléo', 'Ben']);
  });
  it('gives the average number of levels gained per student', () => {
    expect(dash.averageLevels).toBeCloseTo(8 / 3, 5);
  });
  it('handles a centre without students', () => {
    expect(buildCentreDashboard({ students: [], newEnrollments: 0, pendingEvaluations: 0, challengePlayers: 0 }, NOW))
      .toMatchObject({ totalStudents: 0, activeThisWeek: 0, averageLevels: 0, students: [], needAttention: [] });
  });
});

describe('buildExaminerDashboard', () => {
  const rows = [
    { organizationId: 'a', organizationName: 'Alpha', status: 'pending' as const, createdAt: daysAgo(5), correctedAt: null },
    { organizationId: 'a', organizationName: 'Alpha', status: 'pending' as const, createdAt: daysAgo(1), correctedAt: null },
    { organizationId: 'b', organizationName: 'Beta', status: 'pending' as const, createdAt: daysAgo(2), correctedAt: null },
    { organizationId: 'a', organizationName: 'Alpha', status: 'passed' as const, createdAt: daysAgo(3), correctedAt: daysAgo(2) }, // 24 h, last week
    { organizationId: 'b', organizationName: 'Beta', status: 'failed' as const, createdAt: daysAgo(1), correctedAt: new Date(NOW.getTime() - 3_600_000).toISOString() }, // 23 h, this week
  ];
  const dash = buildExaminerDashboard(rows, NOW);

  it('counts what waits, the oldest wait and what was corrected this week', () => {
    expect(dash).toMatchObject({ pending: 3, oldestWaitingDays: 5, correctedThisWeek: 1 });
  });
  it('breaks the queue down by centre, longest first', () => {
    expect(dash.byCentre).toEqual([{ organizationName: 'Alpha', pending: 2 }, { organizationName: 'Beta', pending: 1 }]);
  });
  it('gives the average turnaround in hours', () => {
    expect(dash.averageTurnaroundHours).toBeCloseTo(23.5, 1);
  });
  it('is calm when nothing waits', () => {
    expect(buildExaminerDashboard([], NOW)).toMatchObject({ pending: 0, oldestWaitingDays: 0, correctedThisWeek: 0, averageTurnaroundHours: null, byCentre: [] });
  });
});

describe('nextActionsFor (learner home)', () => {
  const base: LearnerSnapshot = {
    streak: 3, xp: 120, dueReviews: 0, enrolledSkills: [{ skillId: 'logique', name: 'Logique', level: 2, dailyMinutes: 20 }],
    answeredEnrollments: 0, pendingEnrollments: 0, evaluationsToRead: 0, challengePlayed: true, studiedToday: true, canEnroll: true, identityComplete: true, hasLevel: true, startedSkillId: 'logique',
  };
  const ids = (s: LearnerSnapshot) => nextActionsFor(s).map((a) => a.id);

  it('puts reviews due first, then feedback, then the weekly challenge', () => {
    expect(ids({ ...base, dueReviews: 4, evaluationsToRead: 1, challengePlayed: false, studiedToday: false }))
      .toEqual(['reviews', 'feedback', 'challenge', 'practice']);
  });
  it('asks first for the pseudonym and the names (ranking and diploma)', () => {
    expect(ids({ ...base, identityComplete: false, dueReviews: 2 })).toEqual(['profile', 'reviews']);
  });
  it('tells a learner waiting for an examiner that the centre is on it', () => {
    const actions = nextActionsFor({ ...base, dueReviews: 1, waitingOrals: [{ skillId: 'logique', name: 'Logique' }] });
    expect(actions.map((x) => x.id)).toEqual(['reviews', 'oral-logique']);
    expect(actions[1]).toMatchObject({ text: expect.stringMatching(/liste d’attente/), href: '/competences/logique' });
  });
  it('announces an answered enrollment request', () => {
    expect(ids({ ...base, answeredEnrollments: 1 })).toContain('enrollment-answer');
  });
  it('suggests the daily effort of the plan when nothing was done today', () => {
    const practice = nextActionsFor({ ...base, studiedToday: false }).find((a) => a.id === 'practice');
    expect(practice?.text).toContain('20 min');
    expect(practice?.href).toBe('/competences/logique');
  });
  it('invites a newcomer to read a course sheet and apply', () => {
    expect(ids({ ...base, enrolledSkills: [], studiedToday: false })).toEqual(['discover']);
  });
  it('congratulates when everything is done', () => {
    expect(ids(base)).toEqual(['all-done']);
  });
  it('stays quiet about enrolling while a request is already pending', () => {
    expect(ids({ ...base, enrolledSkills: [], pendingEnrollments: 1, studiedToday: false })).toEqual(['waiting']);
  });
});
