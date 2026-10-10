'use client';

import { useState } from 'react';
import type { Outcome } from '../domain/slots';
import { sendOutcome } from '../infra/exam-client';

const CHOICES: { outcome: Outcome; label: string; style: string }[] = [
  { outcome: 'passed', label: '✓ Validé (niveau +1)', style: 'bg-emerald-600 text-white' },
  { outcome: 'failed', label: 'À retravailler', style: 'bg-amber-100 text-amber-900' },
  { outcome: 'no_show', label: 'Absent', style: 'bg-slate-100 text-slate-600' },
];

/** After the oral: the examiner's decision and comment (a comment is required to explain what to rework). */
export function OutcomeForm({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function decide(outcome: Outcome) {
    const failure = await sendOutcome(bookingId, outcome, comment);
    if (failure) setError(failure); else onDone();
  }

  return (
    <div className="mt-2 space-y-2">
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={1000} aria-label="Commentaire pour l’élève"
        placeholder="Commentaire pour l’élève (obligatoire si à retravailler)" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm" />
      <div className="flex flex-wrap gap-2">
        {CHOICES.map((c) => (
          <button key={c.outcome} type="button" onClick={() => decide(c.outcome)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${c.style}`}>{c.label}</button>
        ))}
      </div>
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
    </div>
  );
}
