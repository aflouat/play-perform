'use client';

import { useEffect } from 'react';
import type { BankQuestion } from '@/types';
import { setBankOverlay } from '@/lib/question-bank-overlay';

/** Loads the questions published in the database once per visit; the built-in banks keep working if it fails. */
export function QuestionBankSync() {
  useEffect(() => {
    let active = true;
    fetch('/api/question-bank', { signal: AbortSignal.timeout(3000) })
      .then((r) => (r.ok ? r.json() as Promise<{ questions: BankQuestion[] }> : { questions: [] }))
      .then((d) => { if (active) setBankOverlay(d.questions); })
      .catch(() => { if (active) setBankOverlay([]); }); // offline or slow: built-in banks
    return () => { active = false; };
  }, []);
  return null;
}
