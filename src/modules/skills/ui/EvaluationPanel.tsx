'use client';

import { useEffect, useState } from 'react';
import { getEvaluationPrompt } from '../infra/evaluation-prompts';
import { fetchProfileEvaluations, submitEvaluation } from '../infra/evaluation-client';
import { setSkillLevel, getSkillLevelFor } from '../application/skill-progress';
import { levelAfterEvaluations, ANSWER_MIN, ANSWER_MAX, type SkillEvaluation } from '../domain/evaluation';
import type { SkillLevelNumber } from '../domain/skill';

interface Props { profileId: string; skillId: string; level: SkillLevelNumber | null }

const STATUS_LABEL = { pending: '⏳ En attente de correction', passed: '✅ Validée', failed: '↩️ À reprendre' } as const;

/** Open question for the current level, corrected by an examiner; validated answers raise the level. */
export function EvaluationPanel({ profileId, skillId, level }: Props) {
  const current = level ?? 1;
  const [history, setHistory] = useState<SkillEvaluation[]>([]);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchProfileEvaluations(profileId).then((all) => {
      if (!alive) return;
      const mine = all.filter((e) => e.skillId === skillId);
      setHistory(mine);
      const next = levelAfterEvaluations(getSkillLevelFor(profileId, skillId), mine);
      if (next !== null && next !== getSkillLevelFor(profileId, skillId)) setSkillLevel(profileId, skillId, next);
    }).catch(() => undefined);
    return () => { alive = false; };
  }, [profileId, skillId, reload]);

  const waiting = history.some((e) => e.status === 'pending' && e.level === current);

  async function send() {
    setBusy(true); setMessage(null);
    const result = await submitEvaluation({ profileId, skillId, level: current, answer });
    setBusy(false);
    if (result.ok) { setAnswer(''); setMessage('Envoyé ! Un examinateur va corriger ta réponse.'); setReload((n) => n + 1); }
    else setMessage(result.error);
  }

  return (
    <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5" aria-label="Évaluation">
      <p className="font-bold text-[#1a1a2e]">{getEvaluationPrompt(skillId, current)}</p>
      {waiting ? (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Ta réponse à ce niveau attend sa correction.</p>
      ) : (
        <>
          <label className="block text-xs font-semibold text-slate-500" htmlFor="eval-answer">Ta réponse ({ANSWER_MIN}–{ANSWER_MAX} caractères)</label>
          <textarea id="eval-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} maxLength={ANSWER_MAX}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm" />
          <button onClick={send} disabled={busy || answer.trim().length < ANSWER_MIN}
            className="w-full rounded-2xl bg-violet-600 py-3 font-bold text-white disabled:opacity-40">
            {busy ? 'Envoi…' : 'Envoyer à l’examinateur'}
          </button>
        </>
      )}
      {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
      {history.length > 0 && (
        <ul className="space-y-2 border-t border-slate-100 pt-3">
          {history.map((e) => (
            <li key={e.id} className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-bold">Niveau {e.level} · {STATUS_LABEL[e.status]}</p>
              {e.examinerComment && <p className="mt-1 italic">« {e.examinerComment} »</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
