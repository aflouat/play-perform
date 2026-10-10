import { getServerClient } from '@/lib/db/client';
import type { SkillLevelNumber } from '@/modules/skills';

/** Server-side only (service role): who may give orals in a centre, and the learners waiting for one. */
export interface OralRequest { id: string; profileId: string; organizationId: string; skillId: string; level: SkillLevelNumber; status: 'waiting' | 'booked' | 'cancelled'; createdAt: string }

interface RequestRow { id: string; profile_id: string; organization_id: string; skill_id: string; level: number; status: OralRequest['status']; created_at: string }
const toRequest = (r: RequestRow): OralRequest => ({ id: r.id, profileId: r.profile_id, organizationId: r.organization_id, skillId: r.skill_id, level: r.level as SkillLevelNumber, status: r.status, createdAt: r.created_at });
const db = () => getServerClient();

/** Centres where this person may give orals. */
export async function oralCentresOf(userId: string): Promise<string[]> {
  const { data, error } = await db().from('oral_examiners').select('organization_id').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return ((data ?? []) as { organization_id: string }[]).map((r) => r.organization_id);
}

export async function oralExaminersOf(organizationId: string): Promise<string[]> {
  const { data, error } = await db().from('oral_examiners').select('user_id').eq('organization_id', organizationId);
  if (error) throw new Error(error.message);
  return ((data ?? []) as { user_id: string }[]).map((r) => r.user_id);
}

export async function setOralExaminer(organizationId: string, userId: string, enabled: boolean, grantedBy: string): Promise<void> {
  const { error } = enabled
    ? await db().from('oral_examiners').upsert({ organization_id: organizationId, user_id: userId, granted_by: grantedBy === 'service-role' ? null : grantedBy }, { onConflict: 'organization_id,user_id' })
    : await db().from('oral_examiners').delete().eq('organization_id', organizationId).eq('user_id', userId);
  if (error) throw new Error(error.message);
}

/** Free future slots per examiner of a centre (or of one examiner in all centres when `examinerUserId` is given). */
export async function openSlotCounts(filter: { organizationId?: string; examinerUserId?: string }): Promise<Map<string, number>> {
  let query = db().from('exam_slots').select('examiner_user_id').eq('status', 'available').gte('starts_at', new Date().toISOString());
  if (filter.organizationId) query = query.eq('organization_id', filter.organizationId);
  if (filter.examinerUserId) query = query.eq('examiner_user_id', filter.examinerUserId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const counts = new Map<string, number>();
  for (const r of (data ?? []) as { examiner_user_id: string }[]) counts.set(r.examiner_user_id, (counts.get(r.examiner_user_id) ?? 0) + 1);
  return counts;
}

export async function listWaitingRequests(organizations: 'all' | string[]): Promise<OralRequest[]> {
  if (organizations !== 'all' && organizations.length === 0) return [];
  let query = db().from('oral_requests').select('*').eq('status', 'waiting').order('created_at');
  if (organizations !== 'all') query = query.in('organization_id', organizations);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as RequestRow[]).map(toRequest);
}

export async function listRequestsOfProfile(profileId: string): Promise<OralRequest[]> {
  const { data, error } = await db().from('oral_requests').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(20);
  if (error) throw new Error(error.message);
  return ((data ?? []) as RequestRow[]).map(toRequest);
}

export async function createRequest(profileId: string, organizationId: string, skillId: string, level: SkillLevelNumber): Promise<void> {
  const { error } = await db().from('oral_requests').insert({ profile_id: profileId, organization_id: organizationId, skill_id: skillId, level });
  if (error && error.code !== '23505') throw new Error(error.message); // already waiting: nothing to do
}

/** Closes the waiting requests of a learner for a skill (booked) or one request (cancelled by the centre). */
export async function resolveRequests(where: { profileId: string; skillId: string } | { id: string }, status: 'booked' | 'cancelled'): Promise<void> {
  let query = db().from('oral_requests').update({ status, resolved_at: new Date().toISOString() }).eq('status', 'waiting');
  query = 'id' in where ? query.eq('id', where.id) : query.eq('profile_id', where.profileId).eq('skill_id', where.skillId);
  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function organizationOfRequest(id: string): Promise<string | null> {
  const { data } = await db().from('oral_requests').select('organization_id').eq('id', id).maybeSingle();
  return (data as { organization_id: string } | null)?.organization_id ?? null;
}

/** First and last names of learners (the centre's lists). */
export async function studentNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data } = await db().from('students').select('id, name, last_name').in('id', ids);
  return new Map(((data ?? []) as { id: string; name: string; last_name: string | null }[]).map((s) => [s.id, [s.name, s.last_name].filter(Boolean).join(' ')]));
}

export async function centreNames(ids: string[]): Promise<{ id: string; name: string }[]> {
  if (ids.length === 0) return [];
  const { data } = await db().from('organizations').select('id, name').in('id', ids).order('name');
  return (data ?? []) as { id: string; name: string }[];
}
