import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { getServerClient } from '@/lib/db/client';
import { validateProgressInput } from '@/lib/progress-validate';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** PUT { kind: 'score' | 'badge', profileId, … } → saves a learner's XP / badge (learner session or their teacher). */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const validation = validateProgressInput(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  const input = validation.value;
  try {
    if (!(await canAccessProfile(actor, input.profileId))) return fail('Élève introuvable', 404);
    const now = new Date().toISOString();
    const db = getServerClient();
    const { error } = input.kind === 'score'
      ? await db.from('scores').upsert({ profile_id: input.profileId, xp: input.xp, level: input.level, streak: input.streak, last_activity_at: now, updated_at: now }, { onConflict: 'profile_id' })
      : await db.from('badges').upsert({ profile_id: input.profileId, badge_id: input.badgeId, unlocked_at: now }, { onConflict: 'profile_id,badge_id' });
    if (error) return fail('Enregistrement impossible', 500);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/progress]', err);
    return fail('Erreur serveur', 500);
  }
}
