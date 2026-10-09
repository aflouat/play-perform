import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { BONUS_XP, buildPairView, isoWeek } from '@/modules/competition';
import { ensureNickname, loadPairData, saveBonusClaim } from '@/modules/competition/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

async function pairOf(profileId: string) {
  await ensureNickname(profileId);
  const week = isoWeek(new Date());
  const data = await loadPairData(profileId, week);
  return { week, view: data ? buildPairView(data, profileId, new Date()) : null };
}

/** GET ?profileId=… → my pair of the week (pseudonyms only) and where the contract stands. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    return NextResponse.json({ pair: (await pairOf(profileId)).view });
  } catch (err) {
    console.error('[GET /api/competition/pair]', err);
    return fail('Erreur serveur', 500);
  }
}

/** POST { profileId } → claims the bonus of the week once the pair won it (both got the mention). The device then adds the XP. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const body = (await req.json().catch(() => null)) as { profileId?: unknown } | null;
  const profileId = typeof body?.profileId === 'string' ? body.profileId : '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const { week, view } = await pairOf(profileId);
    if (!view || view.status !== 'won') return fail('Le contrat n’est pas encore rempli : vous devez tous les deux obtenir la mention.', 409);
    if (!(await saveBonusClaim(profileId, week, BONUS_XP))) return fail('Bonus déjà récupéré cette semaine.', 409);
    return NextResponse.json({ xp: BONUS_XP }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/competition/pair]', err);
    return fail('Erreur serveur', 500);
  }
}
