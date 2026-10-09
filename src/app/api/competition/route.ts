import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { DEFAULT_ORGANIZATION_ID } from '@/modules/organizations';
import { buildCompetitionView, type RankMetric } from '@/modules/competition';
import { loadCompetitionData, organizationOf } from '@/modules/competition/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const METRICS: RankMetric[] = ['xp', 'streak', 'levels'];

/** GET ?profileId=…&metric=xp|streak|levels → my centre's ranking (pseudonyms only), the weekly board and my medals. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  const metric = (req.nextUrl.searchParams.get('metric') ?? 'xp') as RankMetric;
  if (!METRICS.includes(metric)) return fail('Critère inconnu.', 400);
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const organizationId = (await organizationOf(profileId)) ?? DEFAULT_ORGANIZATION_ID;
    return NextResponse.json(buildCompetitionView(await loadCompetitionData(organizationId, profileId), profileId, metric, new Date()));
  } catch (err) {
    console.error('[GET /api/competition]', err);
    return fail('Erreur serveur', 500);
  }
}
