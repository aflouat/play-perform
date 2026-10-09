export type ActivityStatus = 'active' | 'idle' | 'dormant';

const DAY_MS = 86_400_000;
export const ACTIVE_DAYS = 7;
export const IDLE_DAYS = 30;

/** Active: worked within a week · idle: within a month · dormant: longer, or never. */
export function activityStatus(lastActivityAt: string | null, now: Date): ActivityStatus {
  if (!lastActivityAt) return 'dormant';
  const days = (now.getTime() - new Date(lastActivityAt).getTime()) / DAY_MS;
  return days <= ACTIVE_DAYS ? 'active' : days <= IDLE_DAYS ? 'idle' : 'dormant';
}

export interface StudentRow {
  id: string; name: string; emoji: string; grade: string;
  xp: number; streak: number; lastActivityAt: string | null;
  /** Sum of the student's skill levels */
  levelsTotal: number; skillsStarted: number;
}
export type StudentLine = StudentRow & { status: ActivityStatus };

export interface CentreInput { students: StudentRow[]; newEnrollments: number; pendingEvaluations: number; challengePlayers: number }

export interface CentreDashboard {
  totalStudents: number; activeThisWeek: number; averageLevels: number;
  /** Enrollments in the complete training during the last 7 days (validated automatically) */
  newEnrollments: number; pendingEvaluations: number; challengePlayers: number;
  /** Everyone, those who need a nudge first */
  students: StudentLine[];
  needAttention: StudentLine[];
}

const ORDER: Record<ActivityStatus, number> = { dormant: 0, idle: 1, active: 2 };

export function buildCentreDashboard(input: CentreInput, now: Date): CentreDashboard {
  const students = input.students
    .map((s): StudentLine => ({ ...s, status: activityStatus(s.lastActivityAt, now) }))
    .sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.name.localeCompare(b.name));
  const total = students.length;
  return {
    totalStudents: total,
    activeThisWeek: students.filter((s) => s.status === 'active').length,
    averageLevels: total === 0 ? 0 : students.reduce((sum, s) => sum + s.levelsTotal, 0) / total,
    newEnrollments: input.newEnrollments,
    pendingEvaluations: input.pendingEvaluations,
    challengePlayers: input.challengePlayers,
    students,
    needAttention: students.filter((s) => s.status !== 'active'),
  };
}
