import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getSkills } from '@/modules/skills';
import { getTrainingPaths, validateTrainingPath } from '@/modules/dashboards';
import { insertTrainingPath, listTrainingPaths } from '@/modules/dashboards/server';

/** GET → { paths } : the whole catalogue, public (the learner's map; inactive paths are no longer offered but stay readable). */
export async function GET(): Promise<NextResponse> {
  try {
    const paths = await listTrainingPaths();
    return NextResponse.json({ paths: paths.length > 0 ? paths : getTrainingPaths() });
  } catch (err) {
    console.error('[GET /api/training-paths] built-in catalogue used:', err);
    return NextResponse.json({ paths: getTrainingPaths() });
  }
}

/** POST → creates a path (parent company only). */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req))) return NextResponse.json({ error: 'Réservé à la société mère' }, { status: 403 });
  const validation = validateTrainingPath(await req.json().catch(() => null), getSkills().map((s) => s.id));
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  try {
    return (await insertTrainingPath(validation.value)) === 'exists'
      ? NextResponse.json({ error: 'Cet identifiant est déjà utilisé par un autre parcours.' }, { status: 409 })
      : NextResponse.json({ path: validation.value }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/training-paths]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
