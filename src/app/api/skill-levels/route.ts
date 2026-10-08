import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/parent-auth';
import { isStudentOfParent, listLevels, raiseLevel, validateLevelUpdate } from '@/modules/skills/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?profileId=… → persisted skill levels of a learner (their parent). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  const userId = await getUserIdFromRequest(req);
  if (!userId) return fail('Non autorisé', 401);
  try {
    if (!(await isStudentOfParent(userId, profileId))) return fail('Élève introuvable', 404);
    return NextResponse.json({ levels: await listLevels(profileId) });
  } catch (err) {
    console.error('[GET /api/skill-levels]', err);
    return fail('Erreur serveur', 500);
  }
}

/** PUT { profileId, skillId, level } → raises a level (never lowers it). */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return fail('Non autorisé', 401);
  const validation = validateLevelUpdate(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  const { profileId, skillId, level } = validation.value;
  try {
    if (!(await isStudentOfParent(userId, profileId))) return fail('Élève introuvable', 404);
    return NextResponse.json({ level: await raiseLevel(profileId, skillId, level) });
  } catch (err) {
    console.error('[PUT /api/skill-levels]', err);
    return fail('Erreur serveur', 500);
  }
}
