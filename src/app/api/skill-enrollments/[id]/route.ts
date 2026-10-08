import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { decideEnrollment, validateEnrollmentDecision } from '@/modules/skills/server';

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/skill-enrollments/:id → the training centre approves or refuses a pending request (admin). */
export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req))) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const validation = validateEnrollmentDecision(await req.json().catch(() => null));
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  try {
    const { id } = await params;
    const enrollment = await decideEnrollment(id, validation.value);
    if (!enrollment) return NextResponse.json({ error: 'Demande introuvable ou déjà traitée' }, { status: 404 });
    return NextResponse.json({ enrollment });
  } catch (err) {
    console.error('[PATCH /api/skill-enrollments]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
