import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { createEnrollment, listEnrollmentsForProfile, listPendingEnrollments, validateEnrollmentRequest } from '@/modules/skills/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?status=pending → requests to answer (training centre = admin) · GET ?profileId=… → a learner's requests. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  try {
    if (searchParams.get('status') === 'pending') {
      if (!(await isAdminAuthorized(req))) return fail('Non autorisé', 403);
      return NextResponse.json({ enrollments: await listPendingEnrollments() });
    }
    const profileId = searchParams.get('profileId') ?? '';
    const actor = await getActorFromRequest(req);
    if (!actor) return fail('Non autorisé', 401);
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    return NextResponse.json({ enrollments: await listEnrollmentsForProfile(profileId) });
  } catch (err) {
    console.error('[GET /api/skill-enrollments]', err);
    return fail('Erreur serveur', 500);
  }
}

/** POST { profileId, skillId, motivation } → the learner asks the centre to join a course. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const validation = validateEnrollmentRequest(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  try {
    if (!(await canAccessProfile(actor, validation.value.profileId))) return fail('Élève introuvable', 404);
    const created = await createEnrollment(validation.value);
    if (!created) return fail('Une demande pour ce cours est déjà en cours ou acceptée.', 409);
    return NextResponse.json({ enrollment: created }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/skill-enrollments]', err);
    return fail('Erreur serveur', 500);
  }
}
