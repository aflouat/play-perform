import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { validateIdentityUpdate } from '@/modules/competition';
import { readIdentity, writeIdentity } from '@/modules/competition/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?profileId=… → first name, last name (diploma), pseudonym (ranking, community), centre. The learner or their teacher. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const identity = await readIdentity(profileId);
    return identity ? NextResponse.json(identity) : fail('Élève introuvable', 404);
  } catch (err) {
    console.error('[GET /api/profile]', err);
    return fail('Erreur serveur', 500);
  }
}

/** PUT { profileId, firstName?, lastName?, nickname? } → the learner completes their profile (a teacher can too). */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const body = await req.json().catch(() => null);
  const profileId = typeof body?.profileId === 'string' ? body.profileId : '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const stored = await readIdentity(profileId);
    const validation = validateIdentityUpdate(body, { firstName: stored?.firstName, lastName: stored?.lastName });
    if (!validation.ok) return fail(validation.error, 400);
    const { firstName, lastName, nickname } = validation.value;
    return (await writeIdentity(profileId, { firstName, lastName, nickname })) === 'taken'
      ? fail('Ce pseudo est déjà pris dans ton centre : choisis-en un autre.', 409)
      : NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/profile]', err);
    return fail('Erreur serveur', 500);
  }
}
