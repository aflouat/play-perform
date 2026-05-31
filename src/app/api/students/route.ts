import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Uses service role when available (bypasses RLS), otherwise anon key with user JWT
function dbForUser(token: string) {
  if (SERVICE_KEY) return createClient(URL, SERVICE_KEY);
  return createClient(URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });
}

async function getUserId(token: string): Promise<string | null> {
  try {
    const db = createClient(URL, SERVICE_KEY || ANON_KEY);
    const { data } = await db.auth.getUser(token);
    return data.user?.id ?? null;
  } catch { return null; }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const userId = await getUserId(token);
  if (!userId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { data, error } = await dbForUser(token).from('students').select('*').eq('parent_id', userId).order('created_at');
  if (error) return NextResponse.json({ students: [] });
  return NextResponse.json({ students: data ?? [] });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const userId = await getUserId(token);
  if (!userId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const payload = { ...body, parent_id: userId };
  const db = dbForUser(token);

  // Try with all fields; fallback without optional columns (migration 007b may not be applied)
  const { data, error } = await db.from('students').insert(payload).select().single();
  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mode: _m, learning_mode: _lm, ...base } = payload as Record<string, unknown>;
    const { data: d2, error: e2 } = await db.from('students').insert(base).select().single();
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    return NextResponse.json({ student: d2 });
  }
  return NextResponse.json({ student: data });
}
