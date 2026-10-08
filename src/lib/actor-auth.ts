import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { getServerClient, getServerSupabaseUrl } from '@/lib/db/client';
import { isLearnerToken, learnerSecret, verifyLearnerToken } from '@/lib/learner-token';

/** Who calls an API route: a teacher (Supabase session) or a learner (access-code session). */
export type Actor = { kind: 'teacher'; userId: string } | { kind: 'learner'; profileId: string };

export async function getActorFromRequest(req: NextRequest): Promise<Actor | null> {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!token) return null;
  try {
    if (isLearnerToken(token)) {
      const verified = verifyLearnerToken(token, new Date(), learnerSecret());
      return verified ? { kind: 'learner', profileId: verified.profileId } : null;
    }
    const db = createClient(getServerSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    const { data } = await db.auth.getUser(token);
    return data.user ? { kind: 'teacher', userId: data.user.id } : null;
  } catch { return null; }
}

/** A learner reaches their own profile only; a teacher reaches the profiles of their own students. */
export async function canAccessProfile(actor: Actor, profileId: string): Promise<boolean> {
  if (actor.kind === 'learner') return actor.profileId === profileId;
  const { data } = await getServerClient().from('students').select('id').eq('id', profileId).eq('parent_id', actor.userId).maybeSingle();
  return data !== null;
}
