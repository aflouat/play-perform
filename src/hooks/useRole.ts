'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { createClient } from '@supabase/supabase-js';
import { hasLearnerToken, subscribeLearnerToken } from '@/lib/auth-token';

/**
 * Who is using this device:
 * - learner: opened a session with an access code (never sees the centre's space)
 * - teacher: signed in with an account (centre, teacher, examiner, admin; never sees the learner's entry)
 * - visitor: neither
 * - loading: not known yet (server render, first paint)
 */
export type Role = 'loading' | 'visitor' | 'learner' | 'teacher';

export function useRole(): Role {
  const learner = useSyncExternalStore(subscribeLearnerToken, hasLearnerToken, () => null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
    db.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = db.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  if (learner === null || signedIn === null) return 'loading';
  if (learner) return 'learner';
  return signedIn ? 'teacher' : 'visitor';
}
