import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { deleteSubscription, saveSubscription } from '@/lib/push/repository';
import { validateSubscriptionInput } from '@/lib/push/validate';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** PUT → registers (or updates) this device's subscription and its reminders. */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const validation = validateSubscriptionInput(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  try {
    if (!(await canAccessProfile(actor, validation.value.profileId))) return fail('Élève introuvable', 404);
    await saveSubscription(validation.value);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/push/subscription]', err);
    return fail('Erreur serveur', 500);
  }
}

/** DELETE { profileId, endpoint } → this device stops receiving reminders. */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const body = (await req.json().catch(() => null)) as { profileId?: unknown; endpoint?: unknown } | null;
  if (typeof body?.profileId !== 'string' || typeof body.endpoint !== 'string') return fail('Requête invalide.', 400);
  try {
    if (!(await canAccessProfile(actor, body.profileId))) return fail('Élève introuvable', 404);
    await deleteSubscription(body.endpoint, body.profileId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/push/subscription]', err);
    return fail('Erreur serveur', 500);
  }
}
