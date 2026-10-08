import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { canCreateOrganization, validateOrganizationInput } from '@/modules/organizations';
import { createOrganization, listOrganizations } from '@/modules/organizations/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET → the centres I belong to ("all" for the super admin). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return fail('Non autorisé', 401);
  try {
    return NextResponse.json({ organizations: await listOrganizations(ctx.isSuperAdmin ? 'all' : ctx.memberships.map((m) => m.organizationId)) });
  } catch (err) {
    console.error('[GET /api/organizations]', err);
    return fail('Erreur serveur', 500);
  }
}

/** POST { name, slug? } → creates a training centre (super admin). */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx || !canCreateOrganization(ctx)) return fail('Non autorisé', 403);
  const validation = validateOrganizationInput(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  try {
    const created = await createOrganization(validation.value);
    if (!created) return fail('Cet identifiant est déjà utilisé.', 409);
    return NextResponse.json({ organization: created }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/organizations]', err);
    return fail('Erreur serveur', 500);
  }
}
