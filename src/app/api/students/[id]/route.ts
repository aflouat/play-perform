import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function serverDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );
}

async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  if (!token) return null;
  try {
    const { data } = await serverDb().auth.getUser(token);
    return data.user?.id ?? null;
  } catch { return null; }
}

type Params = Promise<{ id: string }>;

export async function DELETE(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  const { error } = await serverDb().from('students').delete().eq('id', id).eq('parent_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;
  const { error } = await serverDb().from('students').update(body).eq('id', id).eq('parent_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
