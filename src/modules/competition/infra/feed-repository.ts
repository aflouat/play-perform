import { getServerClient } from '@/lib/db/client';
import { organizationOf } from './competition-repository';

const db = () => getServerClient();

// ── Activity feed and cheers ──────────────────────────────────────────────────

export interface FeedRow { id: string; profileId: string; nickname: string; skillId: string; level: number; createdAt: string; cheers: number; cheeredByMe: boolean }

/** Milestones (level 4, mastery) shown in the feed; one per learner, skill and level. Never blocks the caller. */
export async function recordMilestone(profileId: string, skillId: string, level: number): Promise<void> {
  if (level < 4) return;
  try {
    const organizationId = await organizationOf(profileId);
    if (!organizationId) return;
    await db().from('activity_events').upsert(
      { organization_id: organizationId, profile_id: profileId, skill_id: skillId, level }, { onConflict: 'profile_id,skill_id,level', ignoreDuplicates: true });
  } catch { /* the feed is a bonus: a failure must not fail a level-up */ }
}

export async function loadFeed(profileId: string): Promise<FeedRow[]> {
  const organizationId = await organizationOf(profileId);
  if (!organizationId) return [];
  const { data: students } = await db().from('students').select('id, nickname').eq('organization_id', organizationId).eq('show_in_ranking', true).not('nickname', 'is', null);
  const nick = new Map(((students ?? []) as { id: string; nickname: string }[]).map((s) => [s.id, s.nickname]));
  const { data: events } = await db().from('activity_events').select('id, profile_id, skill_id, level, created_at')
    .eq('organization_id', organizationId).eq('hidden', false).order('created_at', { ascending: false }).limit(60);
  const visible = ((events ?? []) as { id: string; profile_id: string; skill_id: string; level: number; created_at: string }[]).filter((e) => nick.has(e.profile_id)).slice(0, 25);
  if (visible.length === 0) return [];
  const { data: cheers } = await db().from('activity_cheers').select('event_id, profile_id').in('event_id', visible.map((e) => e.id));
  const all = (cheers ?? []) as { event_id: string; profile_id: string }[];
  return visible.map((e) => ({
    id: e.id, profileId: e.profile_id, nickname: nick.get(e.profile_id) as string, skillId: e.skill_id, level: e.level, createdAt: e.created_at,
    cheers: all.filter((c) => c.event_id === e.id).length, cheeredByMe: all.some((c) => c.event_id === e.id && c.profile_id === profileId),
  }));
}

export async function eventInfo(eventId: string): Promise<{ profileId: string; organizationId: string } | null> {
  const { data } = await db().from('activity_events').select('profile_id, organization_id').eq('id', eventId).maybeSingle();
  const row = data as { profile_id: string; organization_id: string } | null;
  return row ? { profileId: row.profile_id, organizationId: row.organization_id } : null;
}

/** Returns false when this learner already cheered this event. */
export async function addCheer(eventId: string, profileId: string): Promise<boolean> {
  const { error } = await db().from('activity_cheers').insert({ event_id: eventId, profile_id: profileId });
  if (!error) return true;
  if (error.code === '23505') return false;
  throw new Error(error.message);
}

export async function hideEvent(eventId: string): Promise<void> {
  const { error } = await db().from('activity_events').update({ hidden: true }).eq('id', eventId);
  if (error) throw new Error(error.message);
}
