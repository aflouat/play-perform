import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { getSkillById } from '@/modules/skills';
import { listRequestsOfProfile, requestOral } from '@/modules/exams/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?profileId=… → the learner's requests (waiting list for the final oral). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const requests = await listRequestsOfProfile(profileId);
    return NextResponse.json({ requests: requests.map((r) => ({ id: r.id, skillId: r.skillId, level: r.level, status: r.status, createdAt: r.createdAt })) });
  } catch (err) {
    console.error('[GET /api/oral-requests]', err);
    return fail('Erreur serveur', 500);
  }
}

/** POST { profileId, skillId } → no examiner available for the final oral: the learner waits, the centre is notified. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const body = await req.json().catch(() => null);
  const profileId = typeof body?.profileId === 'string' ? body.profileId : '';
  const skillId = typeof body?.skillId === 'string' ? body.skillId : '';
  if (!getSkillById(skillId)) return fail('Compétence inconnue.', 400);
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const result = await requestOral(profileId, skillId);
    return result.error && result.status !== 200 ? fail(result.error, result.status) : NextResponse.json({ ok: true }, { status: result.status });
  } catch (err) {
    console.error('[POST /api/oral-requests]', err);
    return fail('Erreur serveur', 500);
  }
}
