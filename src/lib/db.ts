import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lazy client — never instantiated at module level (prevents SSR crash when env vars absent)
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null; // server-side: skip
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key);
  return _client;
}

// ── Types DB ──────────────────────────────────────────────────────────────

export interface DbScore {
  profile_id: string;
  xp: number;
  level: number;
  streak: number;
  last_activity_at: string | null;
  updated_at: string;
}

export interface DbBadge {
  profile_id: string;
  badge_id: string;
  unlocked_at: string;
}

export interface DbQuizAnswer {
  profile_id: string;
  subject: string;
  question_id: string;
  is_correct: boolean;
  xp_earned: number;
}

export interface DbKeyboardProgress {
  profile_id: string;
  mode: string;
  level: number;
  score: number;
  total: number;
}

// ── Score sync ────────────────────────────────────────────────────────────

export async function syncScoreToDb(
  profileId: string,
  xp: number,
  level: number,
  streak: number,
): Promise<void> {
  const db = getClient();
  if (!db) return;
  await db.from('scores').upsert(
    { profile_id: profileId, xp, level, streak, last_activity_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { onConflict: 'profile_id' },
  );
}

export async function fetchScoreFromDb(profileId: string): Promise<DbScore | null> {
  const db = getClient();
  if (!db) return null;
  const { data } = await db.from('scores').select('*').eq('profile_id', profileId).single();
  return data ?? null;
}

export async function syncBadgeToDb(profileId: string, badgeId: string): Promise<void> {
  const db = getClient();
  if (!db) return;
  await db.from('badges').upsert(
    { profile_id: profileId, badge_id: badgeId, unlocked_at: new Date().toISOString() },
    { onConflict: 'profile_id,badge_id' },
  );
}

export async function logQuizAnswer(answer: DbQuizAnswer): Promise<void> {
  const db = getClient();
  if (!db) return;
  await db.from('quiz_answers').insert(answer);
}

export async function logKeyboardSession(progress: DbKeyboardProgress): Promise<void> {
  const db = getClient();
  if (!db) return;
  await db.from('keyboard_progress').insert(progress);
}

// ── Questions (import admin) ───────────────────────────────────────────────

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

// ── Auth helpers ──────────────────────────────────────────────────────────

export function getAuthClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return getClient(); // reuse singleton
}

// ── Students (parent-managed) ─────────────────────────────────────────────

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

export async function insertStudent(student: Omit<DbStudent, 'id' | 'parent_id'>): Promise<DbStudent | null> {
  const db = getClient();
  if (!db) return null;
  const { data } = await db.from('students').insert(student).select().single();
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

function getServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createClient(url, key);
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

// ── Release Notes ─────────────────────────────────────────────────────────

export interface DbReleaseNote {
  id?: string;
  version: string;
  deployed_at?: string;
  title: string;
  summary: string | null;
  changes: string[];
  tags: string[];
  deployed_by: string | null;
}

export interface ReleaseNoteFilter {
  q?: string;
  version?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export async function insertReleaseNote(
  note: Omit<DbReleaseNote, 'id' | 'deployed_at'>,
): Promise<void> {
  const db = getServerClient();
  await db.from('release_notes').insert({ ...note, deployed_at: new Date().toISOString() });
}

export async function fetchReleaseNotes(filter: ReleaseNoteFilter = {}): Promise<DbReleaseNote[]> {
  const db = getClient();
  if (!db) return [];
  let q = db.from('release_notes').select('*').order('deployed_at', { ascending: false });
  if (filter.version) q = q.eq('version', filter.version);
  if (filter.from) q = q.gte('deployed_at', filter.from);
  if (filter.to) q = q.lte('deployed_at', `${filter.to}T23:59:59Z`);
  if (filter.q) q = q.or(`title.ilike.%${filter.q}%,summary.ilike.%${filter.q}%`);
  if (filter.limit) q = q.limit(filter.limit);
  const { data } = await q;
  return (data as DbReleaseNote[]) ?? [];
}
