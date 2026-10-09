import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { DEFAULT_ORGANIZATION_ID } from '@/modules/organizations';
import { challengeFor, isoWeek, scoreChallenge, type ChallengeAnswer } from '@/modules/competition';
import { organizationOf, saveChallengeResult } from '@/modules/competition/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

function parseAnswers(raw: unknown): ChallengeAnswer[] | null {
  if (!Array.isArray(raw) || raw.length > 20) return null;
  const answers = raw.map((a) => (typeof a === 'object' && a !== null ? a as Record<string, unknown> : null));
  if (answers.some((a) => !a || typeof a.questionId !== 'string' || typeof a.optionId !== 'string')) return null;
  return answers.map((a) => ({ questionId: a?.questionId as string, optionId: a?.optionId as string }));
}

/** POST { profileId, answers: [{questionId, optionId}], durationMs } → plays this week's challenge once; the score is recomputed here. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const answers = parseAnswers(body?.answers);
  const durationMs = body?.durationMs;
  if (typeof body?.profileId !== 'string' || !answers || typeof durationMs !== 'number' || !Number.isFinite(durationMs) || durationMs < 0) return fail('Requête invalide.', 400);
  try {
    if (!(await canAccessProfile(actor, body.profileId))) return fail('Élève introuvable', 404);
    const challenge = challengeFor(isoWeek(new Date()));
    const { correct, total } = scoreChallenge(challenge.questions, answers);
    const saved = await saveChallengeResult({
      profileId: body.profileId, organizationId: (await organizationOf(body.profileId)) ?? DEFAULT_ORGANIZATION_ID,
      week: challenge.week, skillId: challenge.skillId, correct, total, durationMs: Math.min(Math.round(durationMs), 3_600_000),
    });
    if (!saved) return fail('Tu as déjà relevé le défi de cette semaine.', 409);
    return NextResponse.json({ correct, total }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/competition/challenge]', err);
    return fail('Erreur serveur', 500);
  }
}
