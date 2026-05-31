import { getClient } from './client';

export interface DbScore {
  profile_id: string;
  xp: number;
  level: number;
  streak: number;
  last_activity_at: string | null;
  updated_at: string;
}

export interface DbBadge { profile_id: string; badge_id: string; unlocked_at: string; }
export interface DbQuizAnswer { profile_id: string; subject: string; question_id: string; is_correct: boolean; xp_earned: number; }
export interface DbKeyboardProgress { profile_id: string; mode: string; level: number; score: number; total: number; }

export async function syncScoreToDb(profileId: string, xp: number, level: number, streak: number): Promise<void> {
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
