import { createClient } from '@supabase/supabase-js';
import type { SkillLevelNumber } from '../domain/skill';
import type { SkillLevels } from '../domain/skill-levels';

async function headers(): Promise<Record<string, string>> {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
  const { data } = await db.auth.getSession();
  return { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token ?? ''}` };
}

/** Browser side: persisted levels of a learner, or null when unavailable (offline, demo profile, not signed in). */
export async function fetchRemoteLevels(profileId: string): Promise<SkillLevels | null> {
  try {
    const res = await fetch(`/api/skill-levels?profileId=${encodeURIComponent(profileId)}`, { headers: await headers() });
    return res.ok ? ((await res.json()) as { levels: SkillLevels }).levels : null;
  } catch { return null; }
}

export async function pushRemoteLevel(profileId: string, skillId: string, level: SkillLevelNumber): Promise<boolean> {
  try {
    const res = await fetch('/api/skill-levels', { method: 'PUT', headers: await headers(), body: JSON.stringify({ profileId, skillId, level }) });
    return res.ok;
  } catch { return false; }
}
