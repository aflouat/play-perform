'use client';

import { useState } from 'react';
import { submitEnrollment } from '../infra/enrollment-client';
import { MOTIVATION_MAX, MOTIVATION_MIN, type SkillEnrollment } from '../domain/enrollment';

interface Props { profileId: string; skillId: string; existing: SkillEnrollment | undefined; onSent: () => void }

const STATUS = {
  pending: { icon: '⏳', text: 'Ta demande est en cours d’examen par le centre de formation.' },
  approved: { icon: '✅', text: 'Demande acceptée : tu peux commencer le cours.' },
  rejected: { icon: '↩️', text: 'Demande refusée. Tu peux en présenter une nouvelle en tenant compte du commentaire.' },
} as const;

/** The learner explains their motivations and asks the training centre to join the course. */
export function EnrollmentForm({ profileId, skillId, existing, onSent }: Props) {
  const [motivation, setMotivation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const blocked = existing?.status === 'pending' || existing?.status === 'approved';

  async function send() {
    setBusy(true); setError(null);
    const result = await submitEnrollment({ profileId, skillId, motivation });
    setBusy(false);
    if (result.ok) { setMotivation(''); onSent(); } else setError(result.error);
  }

  return (
    <section aria-label="Demande d’inscription" className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
      {existing && (
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-bold">{STATUS[existing.status].icon} {STATUS[existing.status].text}</p>
          {existing.centerComment && <p className="mt-1 italic">« {existing.centerComment} »</p>}
        </div>
      )}
      {!blocked && (
        <>
          <label htmlFor="motivation" className="block text-sm font-bold text-[#1a1a2e]">Pourquoi veux-tu suivre ce cours ?</label>
          <textarea id="motivation" value={motivation} onChange={(e) => setMotivation(e.target.value)} rows={5} maxLength={MOTIVATION_MAX}
            placeholder="Parle de tes objectifs, de ce que tu veux savoir faire, de ce qui te motive…"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm" />
          <p className="text-xs text-slate-400">{motivation.trim().length} / {MOTIVATION_MIN} caractères minimum</p>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <button onClick={send} disabled={busy || motivation.trim().length < MOTIVATION_MIN}
            className="w-full rounded-2xl bg-violet-600 py-3 font-bold text-white disabled:opacity-40">
            {busy ? 'Envoi…' : 'Présenter ma demande au centre de formation'}
          </button>
        </>
      )}
    </section>
  );
}
