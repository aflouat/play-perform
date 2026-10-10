'use client';

import { useState } from 'react';
import { DEFAULT_SLOT_MINUTES, SLOT_DURATIONS, splitAvailability } from '../domain/slots';
import { openAvailability } from '../infra/exam-client';

const input = 'rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm';
/** Local date and time typed by the examiner → instant (their device is in the centre's time zone). */
const instant = (day: string, time: string) => (day && time ? new Date(`${day}T${time}:00`) : null);

/** The examiner adds a range of availability in one of their centres; it is cut into slots (30 min by default). */
export function AvailabilityForm({ centres, onAdded }: { centres: { id: string; name: string }[]; onAdded: () => void }) {
  const [organizationId, setOrganizationId] = useState(centres[0]?.id ?? '');
  const [day, setDay] = useState('');
  const [from, setFrom] = useState('09:00');
  const [to, setTo] = useState('12:00');
  const [durationMin, setDurationMin] = useState<number>(DEFAULT_SLOT_MINUTES);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const start = instant(day, from);
  const end = instant(day, to);
  const count = start && end && end > start ? splitAvailability(start, end, durationMin).length : 0;

  async function submit() {
    if (!start || !end) return;
    const error = await openAvailability({ organizationId, from: start.toISOString(), to: end.toISOString(), durationMin });
    setMessage(error ? { ok: false, text: error } : { ok: true, text: `${count} créneau${count > 1 ? 'x' : ''} ouvert${count > 1 ? 's' : ''} (les doublons sont ignorés).` });
    if (!error) onAdded();
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void submit(); }} aria-label="Ajouter des disponibilités" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="font-black text-[#1a1a2e]">➕ Ajouter des disponibilités</h2>
      <div className="flex flex-wrap items-end gap-3 text-sm text-slate-600">
        {centres.length > 1 && (
          <label className="flex flex-col gap-1">Centre
            <select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} className={input}>
              {centres.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1">Jour<input type="date" required value={day} onChange={(e) => setDay(e.target.value)} className={input} /></label>
        <label className="flex flex-col gap-1">De<input type="time" required value={from} onChange={(e) => setFrom(e.target.value)} className={input} /></label>
        <label className="flex flex-col gap-1">À<input type="time" required value={to} onChange={(e) => setTo(e.target.value)} className={input} /></label>
        <label className="flex flex-col gap-1">Durée d’un oral
          <select value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className={input}>
            {SLOT_DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
          </select>
        </label>
        <button type="submit" disabled={count === 0} className="rounded-xl bg-violet-600 px-4 py-2 font-bold text-white disabled:opacity-50">
          Ouvrir {count > 0 ? `${count} créneau${count > 1 ? 'x' : ''}` : 'les créneaux'}
        </button>
      </div>
      {message && <p role={message.ok ? 'status' : 'alert'} className={`text-sm ${message.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{message.text}</p>}
    </form>
  );
}
