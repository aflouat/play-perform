import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { readIdentity } from '@/modules/competition/server';
import { diplomaEligibility, diplomaReference, SKILL_LEVELS } from '@/modules/skills';
import { getSkillById, isEnrolled, listEnrollmentsForProfile, listEvaluationsForProfile, listLevels } from '@/modules/skills/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * GET ?profileId=…&skillId=… → can this learner print the diploma, and what does it say?
 * Everything is read from the database (level, enrollment, examiner-validated evaluations), never from the device.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  const skill = getSkillById(req.nextUrl.searchParams.get('skillId') ?? '');
  if (!skill) return fail('Compétence inconnue.', 404);
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const [levels, enrollments, evaluations, identity] = await Promise.all([
      listLevels(profileId), listEnrollmentsForProfile(profileId), listEvaluationsForProfile(profileId), readIdentity(profileId),
    ]);
    const mine = evaluations.filter((e) => e.skillId === skill.id);
    const hasNames = Boolean(identity?.firstName?.trim() && identity.lastName?.trim());
    const result = diplomaEligibility({ level: levels[skill.id] ?? null, enrolled: isEnrolled(skill.id, enrollments), evaluations: mine, hasNames });
    const diploma = result.eligible && identity && result.issuedOn ? {
      firstName: identity.firstName, lastName: identity.lastName, skillName: skill.name, skillEmoji: skill.emoji,
      levelLabel: SKILL_LEVELS[4].label, centreName: identity.centreName, issuedOn: result.issuedOn,
      reference: diplomaReference(profileId, skill.id, result.issuedOn),
    } : null;
    return NextResponse.json({ eligible: result.eligible, missing: result.missing, diploma });
  } catch (err) {
    console.error('[GET /api/diploma]', err);
    return fail('Erreur serveur', 500);
  }
}
