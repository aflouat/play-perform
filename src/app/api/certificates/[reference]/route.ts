import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { revokeCertificate } from '@/modules/certificates/server';

type Params = { params: Promise<{ reference: string }> };

/** DELETE { reason } → Play Perform revokes a certificate (fraud, error): the verification page then says so. */
export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req))) return NextResponse.json({ error: 'Réservé à la société mère' }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { reason?: unknown } | null;
  const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 500) : '';
  if (reason.length < 5) return NextResponse.json({ error: 'Indique la raison de la révocation.' }, { status: 400 });
  try {
    const { reference } = await params;
    return (await revokeCertificate(reference, reason)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Certificat introuvable ou déjà révoqué' }, { status: 404 });
  } catch (err) {
    console.error('[DELETE /api/certificates/:reference]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
