import { getClient, getServerClient } from './client';

export interface DbQuestion {
  id: string;
  subject: string;
  category: string | null;
  difficulty: number;
  xp_reward: number;
  emoji: string | null;
  image_url: string | null;
  question: string;
  question_assisted: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_assisted: string | null;
  option_b_assisted: string | null;
  option_c_assisted: string | null;
  option_d_assisted: string | null;
  correct_option_id: string;
  explanation: string;
  explanation_assisted: string | null;
}

export async function insertQuestions(rows: DbQuestion[]): Promise<void> {
  const db = getServerClient();
  await db.from('questions').upsert(rows, { onConflict: 'id' });
}

export async function fetchQuestionsFromDb(subject: string): Promise<DbQuestion[]> {
  const db = getClient();
  if (!db) return [];
  const { data } = await db.from('questions').select('*').eq('subject', subject);
  return (data as DbQuestion[]) ?? [];
}

export async function fetchAllQuestionsFromDb(subject?: string): Promise<DbQuestion[]> {
  const db = getServerClient();
  let q = db.from('questions').select('*').order('subject').order('difficulty');
  if (subject) q = q.eq('subject', subject);
  const { data } = await q;
  return (data as DbQuestion[]) ?? [];
}

export async function updateQuestion(id: string, updates: Partial<DbQuestion>): Promise<void> {
  const db = getServerClient();
  await db.from('questions').update(updates).eq('id', id);
}

export async function deleteQuestion(id: string): Promise<void> {
  const db = getServerClient();
  await db.from('questions').delete().eq('id', id);
}
