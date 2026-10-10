import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getSkills } from '@/modules/skills';
import { validateTrainingPath } from '@/modules/dashboards';
import { updateTrainingPath } from '@/modules/dashboards/server';

type Params = { params: Promise<{ id: string }> };

/** PUT /api/training-paths/:id → updates a path: texts, chapters, active (parent company only). */
export async function PUT(req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req))) return NextResponse.json({ error: 'Réservé à la société mère' }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const validation = validateTrainingPath(typeof body === 'object' && body !== null ? { ...body, id } : body, getSkills().map((s) => s.id));
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  try {
    return (await updateTrainingPath(validation.value)) === 'missing'
      ? NextResponse.json({ error: 'Parcours introuvable' }, { status: 404 })
      : NextResponse.json({ path: validation.value });
  } catch (err) {
    console.error('[PUT /api/training-paths/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
