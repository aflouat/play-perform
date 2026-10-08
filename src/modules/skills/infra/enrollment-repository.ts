import { getServerClient } from '@/lib/db/client';
import type { EnrollmentDecision, EnrollmentRequest, EnrollmentStatus, SkillEnrollment } from '../domain/enrollment';

interface Row {
  id: string; profile_id: string; skill_id: string; motivation: string; status: EnrollmentStatus;
  center_comment: string | null; created_at: string; decided_at: string | null;
}

/** An enrollment request waiting for the centre, with the learner's name. */
export interface PendingEnrollment extends SkillEnrollment { studentName: string }

const toEnrollment = (r: Row): SkillEnrollment => ({
  id: r.id, profileId: r.profile_id, skillId: r.skill_id, motivation: r.motivation, status: r.status,
  centerComment: r.center_comment, createdAt: r.created_at, decidedAt: r.decided_at,
});

const table = () => getServerClient().from('skill_enrollments');

/** Server-side only (service role). */
export async function listEnrollmentsForProfile(profileId: string): Promise<SkillEnrollment[]> {
  const { data, error } = await table().select('*').eq('profile_id', profileId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toEnrollment);
}

export async function listPendingEnrollments(): Promise<PendingEnrollment[]> {
  const { data, error } = await table().select('*').eq('status', 'pending').order('created_at');
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];
  const { data: students } = await getServerClient().from('students').select('id, name').in('id', rows.map((r) => r.profile_id));
  const names = new Map(((students ?? []) as { id: string; name: string }[]).map((s) => [s.id, s.name]));
  return rows.map((r) => ({ ...toEnrollment(r), studentName: names.get(r.profile_id) ?? 'Élève' }));
}

/** Returns null when a request for this skill is already waiting or already approved. */
export async function createEnrollment(request: EnrollmentRequest): Promise<SkillEnrollment | null> {
  const { data: open } = await table().select('id').eq('profile_id', request.profileId).eq('skill_id', request.skillId)
    .in('status', ['pending', 'approved']).limit(1);
  if ((open ?? []).length > 0) return null;
  const { data, error } = await table().insert({
    profile_id: request.profileId, skill_id: request.skillId, motivation: request.motivation,
  }).select().single();
  if (error) throw new Error(error.message);
  return toEnrollment(data as Row);
}

export async function decideEnrollment(id: string, decision: EnrollmentDecision): Promise<SkillEnrollment | null> {
  const { data, error } = await table()
    .update({ status: decision.status, center_comment: decision.comment || null, decided_at: new Date().toISOString() })
    .eq('id', id).eq('status', 'pending').select().maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toEnrollment(data as Row) : null;
}
