import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { getServerClient } from '@/lib/db/client';
import { formatAccessCode, generateAccessCode } from '@/lib/access-code';

type Params = { params: Promise<{ id: string }> };

/** POST → (re)generates the access code of one of the teacher's students. The old code stops working. */
export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor || actor.kind !== 'teacher') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessProfile(actor, id))) return NextResponse.json({ error: 'Élève introuvable' }, { status: 404 });
  const code = generateAccessCode();
  const { error } = await getServerClient().from('students').update({ access_code: code }).eq('id', id);
  if (error) return NextResponse.json({ error: 'Impossible de créer le code (la migration learner_access est-elle appliquée ?)' }, { status: 500 });
  return NextResponse.json({ code: formatAccessCode(code) });
}
