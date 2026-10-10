'use client';

import { getSkillById } from '@/modules/skills';
import type { AgendaSlot } from '../domain/types';
import { closeSlot } from '../infra/exam-client';
import { endOf, timeOf } from './format';
import { OutcomeForm } from './OutcomeForm';

const OUTCOME_TEXT = { passed: '✓ Validé', failed: 'À retravailler', no_show: 'Absent' } as const;

/** One slot of the agenda: free (can be closed), booked (who, which skill; result once started), or done. */
export function SlotRow({ slot, now, onChange }: { slot: AgendaSlot; now: Date; onChange: () => void }) {
  const b = slot.booking;
  const started = new Date(slot.startsAt) <= now;
  const time = `${timeOf(slot.startsAt)} – ${endOf(slot.startsAt, slot.durationMin)}`;

  async function close() {
    const question = b ? `Annuler l’oral de ${b.studentName} ? Le créneau sera fermé.` : 'Fermer ce créneau libre ?';
    if (!window.confirm(question)) return;
    const error = await closeSlot(slot.id);
    if (error) window.alert(error); else onChange();
  }

  return (
    <li className={`rounded-xl border p-3 text-sm ${b ? 'border-violet-200 bg-violet-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3">
        <span className="w-28 shrink-0 font-mono text-xs font-bold text-slate-700">{time}</span>
        <span className="flex-1">
          {b
            ? <><strong className="text-[#1a1a2e]">{b.studentName}</strong> · {getSkillById(b.skillId)?.emoji} {getSkillById(b.skillId)?.name ?? b.skillId}, niveau {b.level}</>
            : <span className="text-slate-400">Libre</span>}
        </span>
        {b?.status === 'done' && b.outcome && <span className="text-xs font-bold text-violet-700">{OUTCOME_TEXT[b.outcome]}</span>}
        {!started && <button type="button" onClick={close} className="text-xs text-slate-400 hover:text-rose-600">{b ? 'Annuler' : 'Fermer'}</button>}
      </div>
      {b?.status === 'booked' && started && <OutcomeForm bookingId={b.id} onDone={onChange} />}
    </li>
  );
}
