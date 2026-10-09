import { getServerClient } from '@/lib/db/client';
import { isoWeek } from '@/modules/competition';
import type { CentreInput, StudentRow } from '../domain/centre';
import type { EvaluationRow } from '../domain/examiner';

const db = () => getServerClient();

export interface CentreScope {
  organizationId: string;
  /** Set for a plain teacher: only the students they added. Null = the whole centre. */
  ownerUserId: string | null;
}

/** Server-side only (service role). */
export async function loadCentreInput(scope: CentreScope, now: Date): Promise<CentreInput> {
  let students = db().from('students').select('id, name, emoji, grade').eq('organization_id', scope.organizationId);
  if (scope.ownerUserId) students = students.eq('parent_id', scope.ownerUserId);
  const { data, error } = await students;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as { id: string; name: string; emoji: string; grade: string }[];
  const ids = rows.map((r) => r.id);

  const [scores, levels, enrollments, evaluations, challenge] = await Promise.all([
    ids.length ? db().from('scores').select('profile_id, xp, streak, last_activity_at').in('profile_id', ids) : Promise.resolve({ data: [] }),
    ids.length ? db().from('skill_levels').select('profile_id, level').in('profile_id', ids) : Promise.resolve({ data: [] }),
    db().from('skill_enrollments').select('id', { count: 'exact', head: true }).eq('organization_id', scope.organizationId).eq('status', 'approved')
      .gte('created_at', new Date(now.getTime() - 7 * 86_400_000).toISOString()),
    db().from('skill_evaluations').select('id', { count: 'exact', head: true }).eq('organization_id', scope.organizationId).eq('status', 'pending'),
    db().from('challenge_results').select('id', { count: 'exact', head: true }).eq('organization_id', scope.organizationId).eq('week', isoWeek(now)),
  ]);

  const scoreOf = new Map(((scores.data ?? []) as { profile_id: string; xp: number; streak: number; last_activity_at: string | null }[]).map((s) => [s.profile_id, s]));
  const levelSum = new Map<string, { total: number; started: number }>();
  for (const l of (levels.data ?? []) as { profile_id: string; level: number }[]) {
    const current = levelSum.get(l.profile_id) ?? { total: 0, started: 0 };
    levelSum.set(l.profile_id, { total: current.total + l.level, started: current.started + 1 });
  }
  const students_: StudentRow[] = rows.map((r) => ({
    id: r.id, name: r.name, emoji: r.emoji, grade: r.grade,
    xp: scoreOf.get(r.id)?.xp ?? 0, streak: scoreOf.get(r.id)?.streak ?? 0, lastActivityAt: scoreOf.get(r.id)?.last_activity_at ?? null,
    levelsTotal: levelSum.get(r.id)?.total ?? 0, skillsStarted: levelSum.get(r.id)?.started ?? 0,
  }));
  return {
    students: students_, newEnrollments: enrollments.count ?? 0, pendingEvaluations: evaluations.count ?? 0, challengePlayers: challenge.count ?? 0,
  };
}

/** Evaluations of the centres an examiner works for: everything waiting, plus what was corrected in the last 30 days. */
export async function loadExaminerRows(organizations: 'all' | string[], now: Date): Promise<EvaluationRow[]> {
  if (organizations !== 'all' && organizations.length === 0) return [];
  const since = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  let query = db().from('skill_evaluations').select('organization_id, status, created_at, corrected_at').or(`status.eq.pending,corrected_at.gte.${since}`);
  if (organizations !== 'all') query = query.in('organization_id', organizations);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as { organization_id: string; status: EvaluationRow['status']; created_at: string; corrected_at: string | null }[];

  const { data: orgs } = await db().from('organizations').select('id, name').in('id', [...new Set(rows.map((r) => r.organization_id))]);
  const names = new Map(((orgs ?? []) as { id: string; name: string }[]).map((o) => [o.id, o.name]));
  return rows.map((r) => ({
    organizationId: r.organization_id, organizationName: names.get(r.organization_id) ?? 'Centre', status: r.status, createdAt: r.created_at, correctedAt: r.corrected_at,
  }));
}
