import { getClient, getServerClient } from './client';

export interface DbParcours {
  id?: string;
  name: string;
  emoji: string;
  description?: string;
  subjects: string[];
  questions_per_subject: number;
  created_at?: string;
}

export interface DbParcoursEnrollment {
  id?: string;
  student_id: string;
  parcours_id: string;
  enrolled_at?: string;
  student_name?: string;
  parcours_name?: string;
}

export async function fetchAllParcours(): Promise<DbParcours[]> {
  const db = getServerClient();
  const { data } = await db.from('parcours').select('*').order('created_at');
  return (data as DbParcours[]) ?? [];
}

export async function fetchParcoursById(id: string): Promise<DbParcours | null> {
  const db = getServerClient();
  const { data } = await db.from('parcours').select('*').eq('id', id).single();
  return (data as DbParcours) ?? null;
}

export async function insertParcours(p: Omit<DbParcours, 'id' | 'created_at'>): Promise<DbParcours | null> {
  const db = getServerClient();
  const { data } = await db.from('parcours').insert(p).select().single();
  return (data as DbParcours) ?? null;
}

export async function updateParcours(id: string, updates: Partial<DbParcours>): Promise<void> {
  const db = getServerClient();
  await db.from('parcours').update(updates).eq('id', id);
}

export async function deleteParcours(id: string): Promise<void> {
  const db = getServerClient();
  await db.from('parcours').delete().eq('id', id);
}

export async function fetchEnrollmentsForParcours(parcoursId: string): Promise<DbParcoursEnrollment[]> {
  const db = getServerClient();
  const { data } = await db
    .from('parcours_enrollments')
    .select('*, students(name)')
    .eq('parcours_id', parcoursId);
  return ((data ?? []) as Array<DbParcoursEnrollment & { students?: { name: string } }>).map((row) => ({
    ...row,
    student_name: row.students?.name,
  }));
}

export async function fetchEnrollmentsForStudent(studentId: string): Promise<DbParcoursEnrollment[]> {
  const db = getClient();
  if (!db) return [];
  const { data } = await db
    .from('parcours_enrollments')
    .select('*, parcours(name, emoji, subjects, questions_per_subject)')
    .eq('student_id', studentId);
  return ((data ?? []) as Array<DbParcoursEnrollment & { parcours?: { name: string } }>).map((row) => ({
    ...row,
    parcours_name: (row.parcours as unknown as { name: string } | undefined)?.name,
  }));
}

export async function enrollStudent(studentId: string, parcoursId: string): Promise<void> {
  const db = getServerClient();
  await db.from('parcours_enrollments').upsert({ student_id: studentId, parcours_id: parcoursId });
}

export async function unenrollStudent(studentId: string, parcoursId: string): Promise<void> {
  const db = getServerClient();
  await db.from('parcours_enrollments').delete().eq('student_id', studentId).eq('parcours_id', parcoursId);
}
