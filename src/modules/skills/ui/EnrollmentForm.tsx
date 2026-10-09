'use client';

import { useState } from 'react';
import { submitEnrollment } from '../infra/enrollment-client';
import { MOTIVATION_MAX, type SkillEnrollment } from '../domain/enrollment';

interface Props { profileId: string; skillId: string; existing: SkillEnrollment | undefined; onSent: () => void }

/** Enrollment in the complete training: immediate (validated automatically), the reason is optional. */
export function EnrollmentForm({ profileId, skillId, existing, onSent }: Props) {
  const [motivation, setMotivation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const withdrawn = existing?.status === 'rejected';
  const waiting = existing?.status === 'pending';

  async function enroll() {
    setBusy(true); setError(null);
    const result = await submitEnrollment({ profileId, skillId, motivation });
    setBusy(false);
    if (result.ok) { setMotivation(''); onSent(); } else setError(result.error);
  }

  return (
    <section aria-label="Inscription à la formation complète" className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
      {withdrawn && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Ton centre a retiré cet accès{existing?.centerComment ? ` : « ${existing.centerComment} »` : ''}. Tu peux t’inscrire à nouveau.
        </p>
      )}
      {waiting ? (
        <p role="status" className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">⏳ Ton inscription est en cours de traitement par ton centre.</p>
      ) : (
        <>
          <h2 className="font-black text-[#1a1a2e]">Suivre la formation complète</h2>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>✅ Inscription immédiate, sans attendre de validation</li>
            <li>📝 Évaluations rédigées corrigées par un examinateur</li>
            <li>🎯 Plan de travail et rappels quotidiens</li>
            <li>🎓 Diplôme à imprimer quand tu maîtrises la compétence</li>
          </ul>
          <label htmlFor="motivation" className="block text-xs font-semibold text-slate-500">Pourquoi ce cours ? (facultatif)</label>
          <textarea id="motivation" value={motivation} onChange={(e) => setMotivation(e.target.value)} rows={3} maxLength={MOTIVATION_MAX}
            placeholder="Ton objectif, ce que tu veux savoir faire… Ton centre le verra." className="w-full rounded-xl border border-slate-300 p-3 text-sm" />
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <button onClick={enroll} disabled={busy} className="w-full rounded-2xl bg-violet-600 py-3 font-bold text-white disabled:opacity-40">
            {busy ? 'Inscription…' : 'Je m’inscris à la formation complète'}
          </button>
          <p className="text-center text-xs text-slate-400">Les quiz et les flashcards restent libres : pas besoin d’être inscrit pour t’entraîner.</p>
        </>
      )}
    </section>
  );
}
