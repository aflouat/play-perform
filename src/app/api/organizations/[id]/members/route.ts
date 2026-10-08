import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { ORG_ROLES, canRecruit, validateMemberInput, type OrgRole } from '@/modules/organizations';
import { addMember, findOrInviteUser, listMembers, removeMember } from '@/modules/organizations/server';

type Params = { params: Promise<{ id: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET → members of a centre (centre manager or super admin). */
export async function GET(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  const { id } = await params;
  if (!ctx || !canRecruit(ctx, id)) return fail('Non autorisé', 403);
  try {
    return NextResponse.json({ members: await listMembers(id) });
  } catch (err) {
    console.error('[GET members]', err);
    return fail('Erreur serveur', 500);
  }
}

/** POST { email, role } → recruits a teacher or examiner (invitation e-mail if they have no account). Only the super admin names centre managers. */
export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  const { id } = await params;
  if (!ctx || !canRecruit(ctx, id)) return fail('Non autorisé', 403);
  const validation = validateMemberInput(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  const { email, role } = validation.value;
  if (role === 'org_admin' && !ctx.isSuperAdmin) return fail('Seul le super admin nomme un responsable de centre.', 403);
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
    const { userId, invited } = await findOrInviteUser(email, `${site}/auth/confirm`);
    await addMember(id, userId, email, role);
    return NextResponse.json({ ok: true, invited }, { status: 201 });
  } catch (err) {
    console.error('[POST members]', err);
    return fail('Invitation impossible. Vérifie l’adresse e-mail et la configuration SMTP.', 500);
  }
}

/** DELETE ?userId=…&role=… → removes one role of a member. */
export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  const { id } = await params;
  if (!ctx || !canRecruit(ctx, id)) return fail('Non autorisé', 403);
  const userId = req.nextUrl.searchParams.get('userId') ?? '';
  const role = req.nextUrl.searchParams.get('role') as OrgRole;
  if (!userId || !ORG_ROLES.includes(role)) return fail('Requête invalide.', 400);
  if (role === 'org_admin' && !ctx.isSuperAdmin) return fail('Seul le super admin retire un responsable de centre.', 403);
  try {
    await removeMember(id, userId, role);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE members]', err);
    return fail('Erreur serveur', 500);
  }
}
