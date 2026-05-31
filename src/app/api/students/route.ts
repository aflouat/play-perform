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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { data } = await serverDb().from('students').select('*').eq('parent_id', userId).order('created_at');
  return NextResponse.json({ students: data ?? [] });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const payload = { ...body, parent_id: userId };

  // Try full insert (with mode/learning_mode if columns exist)
  const db = serverDb();
  const { data, error } = await db.from('students').insert(payload).select().single();
  if (error) {
    // Fallback: insert without optional columns that may not exist yet (migration 007b pending)
    const { mode: _m, learning_mode: _lm, ...base } = payload as Record<string, unknown>;
    const { data: fallback, error: err2 } = await db.from('students').insert(base).select().single();
    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
    return NextResponse.json({ student: fallback });
  }
  return NextResponse.json({ student: data });
}
