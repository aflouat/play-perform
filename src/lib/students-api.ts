/**
 * Client-side wrappers that call the /api/students routes (service role, bypasses RLS).
 * Always pass the Supabase access_token for authentication.
 */
import type { DbStudent } from '@/lib/db';

async function getToken(): Promise<string> {
  const { createClient } = await import('@supabase/supabase-js');
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  );
  const { data } = await db.auth.getSession();
  return data.session?.access_token ?? '';
}

export async function apiInsertStudent(
  student: Omit<DbStudent, 'id' | 'parent_id'>,
): Promise<DbStudent | null> {
  const token = await getToken();
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify(student),
  });
  const json = await res.json() as { student?: DbStudent; error?: string };
  if (!res.ok || json.error) { console.error('[apiInsertStudent]', json.error); return null; }
  return json.student ?? null;
}

export async function apiFetchStudents(): Promise<DbStudent[]> {
  const token = await getToken();
  const res = await fetch('/api/students', { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const json = await res.json() as { students: DbStudent[] };
  return json.students;
}

export async function apiDeleteStudent(id: string): Promise<boolean> {
  const token = await getToken();
  const res = await fetch(`/api/students/${id}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export async function apiUpdateStudent(id: string, updates: Partial<DbStudent>): Promise<boolean> {
  const token = await getToken();
  const res = await fetch(`/api/students/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify(updates),
  });
  return res.ok;
}
