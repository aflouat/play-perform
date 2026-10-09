import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { DEFAULT_ORGANIZATION_ID, canDecideEnrollments, organizationsWhere } from '@/modules/organizations';
import { organizationOfStudent } from '@/modules/organizations/server';
import { createEnrollment, listEnrollmentsForProfile, listPendingEnrollments, listRecentEnrollments, validateEnrollmentRequest } from '@/modules/skills/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?status=pending → legacy requests to answer · ?status=recent → enrollments of the last 30 days (a centre can withdraw one) · ?profileId=… → a learner's enrollments. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  try {
    if (searchParams.get('status') === 'pending') {
      const ctx = await getAccessContext(req);
      if (!ctx) return fail('Non autorisé', 403);
      return NextResponse.json({ enrollments: await listPendingEnrollments(organizationsWhere(ctx, canDecideEnrollments)) });
    }
    if (searchParams.get('status') === 'recent') {
      const ctx = await getAccessContext(req);
      if (!ctx) return fail('Non autorisé', 403);
      const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
      return NextResponse.json({ enrollments: await listRecentEnrollments(organizationsWhere(ctx, canDecideEnrollments), since) });
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

/** POST { profileId, skillId, motivation? } → the learner enrolls in the complete training (validated automatically). */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const validation = validateEnrollmentRequest(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  try {
    if (!(await canAccessProfile(actor, validation.value.profileId))) return fail('Élève introuvable', 404);
    const organizationId = (await organizationOfStudent(validation.value.profileId)) ?? DEFAULT_ORGANIZATION_ID;
    const created = await createEnrollment(validation.value, organizationId);
    if (!created) return fail('Une demande pour ce cours est déjà en cours ou acceptée.', 409);
    return NextResponse.json({ enrollment: created }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/skill-enrollments]', err);
    return fail('Erreur serveur', 500);
  }
}
