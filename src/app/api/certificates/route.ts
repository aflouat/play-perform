import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { issueIfEligible, linkedInAddToProfileUrl, linkedInShareUrl, siteUrl, verificationUrl } from '@/modules/certificates/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * GET ?profileId=…&skillId=… → the learner's certificate for a skill, issued on the spot once eligible
 * (null while the diploma is not earned), with its verification and LinkedIn links.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  const skillId = req.nextUrl.searchParams.get('skillId') ?? '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const c = await issueIfEligible(profileId, skillId);
    if (!c) return NextResponse.json({ certificate: null });
    const verifyUrl = verificationUrl(siteUrl(req.nextUrl.origin), c.reference, c.signature);
    return NextResponse.json({ certificate: {
      reference: c.reference, issuedOn: c.issuedOn, revoked: c.revokedAt !== null, verifyUrl,
      linkedInAddUrl: linkedInAddToProfileUrl(c, verifyUrl), linkedInShareUrl: linkedInShareUrl(verifyUrl),
    } });
  } catch (err) {
    console.error('[GET /api/certificates]', err);
    return fail('Erreur serveur', 500);
  }
}
