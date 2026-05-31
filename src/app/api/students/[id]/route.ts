import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function dbForUser(token: string) {
  if (SERVICE_KEY) return createClient(URL, SERVICE_KEY);
  return createClient(URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });
}

async function getUserId(token: string): Promise<string | null> {
  try {
    const { data } = await createClient(URL, SERVICE_KEY || ANON_KEY).auth.getUser(token);
    return data.user?.id ?? null;
  } catch { return null; }
}

function pickFields<T extends Record<string, unknown>>(obj: T, keys: string[]) {
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) acc[key] = obj[key];
    return acc;
  }, {} as Record<string, unknown>);
}

async function cleanupRelatedRecords(db: ReturnType<typeof dbForUser>, profileId: string): Promise<void> {
  await Promise.allSettled([
    db.from('quiz_answers').delete().eq('profile_id', profileId),
    db.from('keyboard_progress').delete().eq('profile_id', profileId),
    db.from('badges').delete().eq('profile_id', profileId),
    db.from('scores').delete().eq('profile_id', profileId),
    db.from('profiles').delete().eq('id', profileId),
  ]);
}

type Params = Promise<{ id: string }>;

export async function DELETE(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const userId = await getUserId(token);
  if (!userId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  const db = dbForUser(token);

  await cleanupRelatedRecords(db, id);
  const { error } = await db.from('students').delete().eq('id', id).eq('parent_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const userId = await getUserId(token);
  if (!userId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;
  const db = dbForUser(token);
  const { error } = await db.from('students').update(body).eq('id', id).eq('parent_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const profileUpdate = pickFields(body, ['name', 'emoji', 'gradient', 'grade', 'tagline', 'age', 'mode']);
  if (Object.keys(profileUpdate).length > 0) {
    void db.from('profiles').upsert({ id, ...profileUpdate }, { onConflict: 'id' });
  }

  return NextResponse.json({ ok: true });
}
