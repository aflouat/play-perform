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

function pickFields<T extends Record<string, unknown>>(obj: T, keys: string[]) {
  return keys.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) acc[key] = obj[key];
    return acc;
  }, {} as Record<string, unknown>);
}

async function createSupportRecords(db: ReturnType<typeof dbForUser>, student: Record<string, unknown>): Promise<void> {
  const score = {
    profile_id: student.id,
    xp: 0,
    level: 1,
    streak: 0,
    last_activity_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const profile = pickFields(student, ['id', 'parent_id', 'name', 'emoji', 'gradient', 'grade', 'tagline', 'age', 'mode']);

  await Promise.allSettled([
    db.from('scores').upsert(score, { onConflict: 'profile_id' }),
    db.from('profiles').upsert(profile, { onConflict: 'id' }),
  ]);
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

  async function insertStudent(payloadData: Record<string, unknown>) {
    const { data, error } = await db.from('students').insert(payloadData).select().single();
    if (error) throw error;
    return data as Record<string, unknown>;
  }

  let student;
  try {
    student = await insertStudent(payload);
  } catch {
    const { mode: _m, learning_mode: _lm, ...base } = payload as Record<string, unknown>;
    try {
      student = await insertStudent(base);
    } catch (fallbackError: unknown) {
      const message = fallbackError instanceof Error ? fallbackError.message : 'Erreur interne';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  await createSupportRecords(db, student).catch(() => {});
  return NextResponse.json({ student });
}
