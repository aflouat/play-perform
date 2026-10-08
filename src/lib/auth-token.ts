import { createClient } from '@supabase/supabase-js';

const LEARNER_KEY = 'pp:learner-token';

export function saveLearnerToken(token: string): void {
  try { localStorage.setItem(LEARNER_KEY, token); } catch { /* storage unavailable */ }
}

export function clearLearnerToken(): void {
  try { localStorage.removeItem(LEARNER_KEY); } catch { /* storage unavailable */ }
}

export function hasLearnerToken(): boolean {
  try { return localStorage.getItem(LEARNER_KEY) !== null; } catch { return false; }
}

/** Token sent to the API: the learner's own session when there is one, else the teacher's Supabase session. */
export async function getAuthToken(): Promise<string> {
  try {
    const learner = localStorage.getItem(LEARNER_KEY);
    if (learner) return learner;
  } catch { /* storage unavailable */ }
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
  const { data } = await db.auth.getSession();
  return data.session?.access_token ?? '';
}
