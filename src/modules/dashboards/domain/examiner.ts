export interface EvaluationRow {
  organizationId: string; organizationName: string;
  status: 'pending' | 'passed' | 'failed'; createdAt: string; correctedAt: string | null;
}

export interface ExaminerDashboard {
  pending: number; oldestWaitingDays: number; correctedThisWeek: number;
  /** Mean time between submission and correction (corrected evaluations), null when none */
  averageTurnaroundHours: number | null;
  byCentre: { organizationName: string; pending: number }[];
}

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

/** Monday 00:00 of the week of `now` (UTC). */
function weekStart(now: Date): number {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return d.getTime() - ((d.getUTCDay() + 6) % 7) * DAY_MS;
}

export function buildExaminerDashboard(rows: readonly EvaluationRow[], now: Date): ExaminerDashboard {
  const pending = rows.filter((r) => r.status === 'pending');
  const corrected = rows.filter((r) => r.status !== 'pending' && r.correctedAt);
  const waits = pending.map((r) => now.getTime() - new Date(r.createdAt).getTime());
  const turnarounds = corrected.map((r) => new Date(r.correctedAt as string).getTime() - new Date(r.createdAt).getTime());
  const perCentre = new Map<string, number>();
  for (const r of pending) perCentre.set(r.organizationName, (perCentre.get(r.organizationName) ?? 0) + 1);
  return {
    pending: pending.length,
    oldestWaitingDays: waits.length ? Math.floor(Math.max(...waits) / DAY_MS) : 0,
    correctedThisWeek: corrected.filter((r) => new Date(r.correctedAt as string).getTime() >= weekStart(now)).length,
    averageTurnaroundHours: turnarounds.length ? turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length / HOUR_MS : null,
    byCentre: [...perCentre.entries()].map(([organizationName, count]) => ({ organizationName, pending: count })).sort((a, b) => b.pending - a.pending),
  };
}
