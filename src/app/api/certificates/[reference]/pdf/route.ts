import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { certificatePdf, findCertificate, siteUrl, verificationUrl } from '@/modules/certificates/server';

type Params = { params: Promise<{ reference: string }> };

/** GET → the PDF of a certificate (its holder or their teacher); a revoked certificate is no longer delivered. */
export async function GET(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try {
    const { reference } = await params;
    const c = await findCertificate(reference);
    if (!c || !(await canAccessProfile(actor, c.profileId))) return NextResponse.json({ error: 'Certificat introuvable' }, { status: 404 });
    if (c.revokedAt) return NextResponse.json({ error: 'Ce certificat a été révoqué.' }, { status: 410 });
    const bytes = await certificatePdf(c, verificationUrl(siteUrl(req.nextUrl.origin), c.reference, c.signature));
    return new NextResponse(Buffer.from(bytes), { headers: {
      'content-type': 'application/pdf', 'content-disposition': `attachment; filename="certificat-${c.reference}.pdf"`, 'cache-control': 'private, no-store',
    } });
  } catch (err) {
    console.error('[GET /api/certificates/:reference/pdf]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
