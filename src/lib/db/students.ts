import { getClient } from './client';

export interface DbStudent {
  id?: string;
  parent_id?: string;
  name: string;
  emoji: string;
  gradient: string;
  grade: string;
  tagline: string;
  age: number;
}

export async function fetchStudents(): Promise<DbStudent[]> {
  const db = getClient();
  if (!db) return [];
  const { data } = await db.from('students').select('*').order('created_at');
  return (data as DbStudent[]) ?? [];
}

export async function insertStudent(
  student: Omit<DbStudent, 'id' | 'parent_id'>,
  parentId?: string,
): Promise<DbStudent | null> {
  const db = getClient();
  if (!db) return null;
  const payload = parentId ? { ...student, parent_id: parentId } : student;
  const { data } = await db.from('students').insert(payload).select().single();
  return (data as DbStudent) ?? null;
}

export async function deleteStudent(id: string): Promise<void> {
  const db = getClient();
  if (!db) return;
  await db.from('students').delete().eq('id', id);
}

export async function updateStudent(id: string, updates: Partial<DbStudent>): Promise<void> {
  const db = getClient();
  if (!db) return;
  await db.from('students').update(updates).eq('id', id);
}
