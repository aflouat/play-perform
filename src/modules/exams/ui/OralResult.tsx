import type { LearnerBooking } from '../domain/types';
import { whenLabel } from './format';

const TEXT = {
  passed: { title: '🎉 Oral validé : niveau suivant atteint !', style: 'bg-emerald-50 text-emerald-900' },
  failed: { title: '💡 Presque ! Voilà ce que l’examinateur te conseille :', style: 'bg-amber-50 text-amber-900' },
  no_show: { title: 'Absent à ton dernier oral : réserve un nouveau créneau quand tu es prêt(e).', style: 'bg-slate-50 text-slate-700' },
} as const;

/** Result of the learner's last oral in a skill, worded as a step forward (never "échec"). */
export function OralResult({ oral }: { oral: LearnerBooking }) {
  if (!oral.outcome) return null;
  const text = TEXT[oral.outcome];
  return (
    <div className={`rounded-2xl p-3 text-sm ${text.style}`}>
      <p className="font-bold">{text.title}</p>
      {oral.examinerComment && <p className="mt-1">« {oral.examinerComment} »</p>}
      <p className="mt-1 text-xs opacity-70">Oral du {whenLabel(oral.startsAt)}</p>
    </div>
  );
}
