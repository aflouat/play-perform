import { NextRequest, NextResponse } from 'next/server';
import { updateQuestion, deleteQuestion } from '@/lib/db';
import type { DbQuestion } from '@/lib/db';

function isAuthorized(req: NextRequest): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return !!key && req.headers.get('authorization') === `Bearer ${key}`;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json() as Partial<DbQuestion>;
    await updateQuestion(id, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/questions/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  try {
    await deleteQuestion(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/questions/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
