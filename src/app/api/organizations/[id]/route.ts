import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { canRecruit, validateCentreIdentity } from '@/modules/organizations';
import { updateIdentity } from '@/modules/organizations/server';

type Params = { params: Promise<{ id: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** PUT { legalName, siren, siret, address, postalCode, city } → the centre's legal identity (its manager or the super admin). */
export async function PUT(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  const { id } = await params;
  if (!ctx || !canRecruit(ctx, id)) return fail('Non autorisé', 403);
  const validation = validateCentreIdentity(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  try {
    return (await updateIdentity(id, validation.value)) === 'taken'
      ? fail('Ce SIRET est déjà enregistré pour un autre centre.', 409)
      : NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/organizations/:id]', err);
    return fail('Erreur serveur', 500);
  }
}
