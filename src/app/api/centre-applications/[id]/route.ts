import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { validateApplicationDecision } from '@/modules/organizations';
import { decideApplication } from '@/modules/organizations/server';

type Params = { params: Promise<{ id: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** PATCH { status: approved | rejected, comment } → opens the centre (and names its manager) or refuses the application (super admin). */
export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx?.isSuperAdmin) return fail('Non autorisé', 403);
  const validation = validateApplicationDecision(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  try {
    const { id } = await params;
    const result = await decideApplication(id, validation.value);
    if (result.ok) return NextResponse.json({ application: result.application });
    return result.reason === 'no-account'
      ? fail('Le demandeur n’a pas encore créé son compte avec cette adresse e-mail.', 409)
      : fail('Dossier introuvable ou déjà traité.', 404);
  } catch (err) {
    console.error('[PATCH /api/centre-applications]', err);
    return fail('Erreur serveur', 500);
  }
}
