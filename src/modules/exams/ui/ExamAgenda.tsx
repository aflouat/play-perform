'use client';

import { useCallback, useEffect, useState } from 'react';
import { groupByDay } from '../domain/slots';
import type { AgendaSlot } from '../domain/types';
import { fetchAgenda } from '../infra/exam-client';
import { fetchExaminerStatus } from '../infra/staffing-client';
import { AvailabilityForm } from './AvailabilityForm';
import { SlotRow } from './SlotRow';
import { dayLabel, TIME_ZONE } from './format';

const mondayOf = (d: Date) => { const m = new Date(d.getFullYear(), d.getMonth(), d.getDate()); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; };
const plusDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/** The examiner's week: their slots day by day, the orals booked, results to record; and the form to open new slots. */
export function ExamAgenda() {
  const [monday, setMonday] = useState(() => mondayOf(new Date()));
  const [slots, setSlots] = useState<AgendaSlot[] | null>(null);
  const [centres, setCentres] = useState<{ id: string; name: string }[] | null>(null);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(() => {
    fetchAgenda(monday.toISOString(), plusDays(monday, 7).toISOString()).then((list) => { setSlots(list ?? []); setNow(new Date()); });
  }, [monday]);
  useEffect(load, [load]);
  useEffect(() => {
    // Centres that allowed this person to give orals
    fetchExaminerStatus().then((status) => setCentres(status?.centres ?? []));
  }, []);

  if (centres && centres.length === 0) {
    return <p role="alert" className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Ton centre ne t’a pas encore confié les oraux : son responsable peut l’activer pour toi dans « Mon centre » (« Peut faire passer les oraux »).</p>;
  }
  const days = groupByDay(slots ?? [], TIME_ZONE);
  const booked = (slots ?? []).filter((s) => s.booking).length;
  return (
    <div className="space-y-5">
      {centres && <AvailabilityForm centres={centres} onAdded={load} />}
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setMonday(plusDays(monday, -7))} className="text-sm font-bold text-violet-600">← Semaine précédente</button>
        <p className="text-sm font-bold text-slate-700">
          Semaine du {monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          {slots && <span className="font-normal text-slate-500"> · {slots.length} créneau{slots.length > 1 ? 'x' : ''}, {booked} réservé{booked > 1 ? 's' : ''}</span>}
        </p>
        <button type="button" onClick={() => setMonday(plusDays(monday, 7))} className="text-sm font-bold text-violet-600">Semaine suivante →</button>
      </div>
      {slots === null && <p className="text-sm text-slate-400">Chargement…</p>}
      {slots?.length === 0 && <p className="text-sm text-slate-500">Aucun créneau cette semaine : ajoute tes disponibilités ci-dessus.</p>}
      {days.map((d) => (
        <section key={d.day} aria-label={dayLabel(d.day)} className="space-y-2">
          <h2 className="text-sm font-black capitalize text-[#1a1a2e]">{dayLabel(d.day)}</h2>
          <ul className="space-y-2">{d.slots.map((s) => <SlotRow key={s.id} slot={s} now={now} onChange={load} />)}</ul>
        </section>
      ))}
    </div>
  );
}
