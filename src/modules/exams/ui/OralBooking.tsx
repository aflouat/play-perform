'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isEnrolled, useEnrollments, useSkillLevels } from '@/modules/skills';
import { groupByDay, LEARNER_CANCEL_HOURS } from '../domain/slots';
import type { ExamSlot, LearnerBooking } from '../domain/types';
import { bookOralSlot, cancelOral, fetchMyOrals, fetchOpenSlots } from '../infra/exam-client';
import { dayLabel, timeOf, TIME_ZONE, whenLabel } from './format';
import { OralResult } from './OralResult';
import { isFinalOralPhase } from '../domain/staffing';
import { fetchMyOralRequests, joinOralWaitingList, type MyOralRequest } from '../infra/staffing-client';
import { OralWaitingMessage } from './OralWaitingMessage';

const HOUR_MS = 60 * 60 * 1000;

/** "Passer l'oral": the learner of a full course picks a free slot of their centre, sees their booking and the last result. */
export function OralBooking({ profileId, skillId }: { profileId: string; skillId: string }) {
  const { enrollments, loaded } = useEnrollments(profileId);
  const [orals, setOrals] = useState<LearnerBooking[] | null>(null);
  const [slots, setSlots] = useState<ExamSlot[]>([]);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [requests, setRequests] = useState<MyOralRequest[]>([]);
  const [now] = useState(() => Date.now());
  const level = useSkillLevels(profileId)[skillId] ?? null;
  const asked = useRef(false);

  const load = useCallback(() => {
    Promise.all([fetchMyOrals(profileId), fetchOpenSlots(profileId), fetchMyOralRequests(profileId)])
      .then(([mine, open, waiting]) => { setOrals(mine); setSlots(open); setRequests(waiting); });
  }, [profileId]);
  useEffect(load, [load]);

  const enrolled = isEnrolled(skillId, enrollments);
  const waiting = requests.find((r) => r.skillId === skillId && r.status === 'waiting');
  const hasUpcoming = (orals ?? []).some((o) => o.skillId === skillId && o.status === 'booked' && new Date(o.startsAt).getTime() > now);
  // Final oral but nobody available: join the waiting list once, the centre is notified
  const mustWait = loaded && orals !== null && enrolled && isFinalOralPhase(level) && slots.length === 0 && !hasUpcoming && !waiting;
  useEffect(() => {
    if (!mustWait || asked.current) return;
    asked.current = true;
    joinOralWaitingList(profileId, skillId).then(load);
  }, [mustWait, profileId, skillId, load]);

  if (!loaded || orals === null) return null;
  if (!enrolled) {
    return (
      <section aria-label="Oral" className="rounded-3xl bg-white p-5 text-sm text-slate-600 shadow-sm">
        🎤 L’oral avec un examinateur fait partie de la formation complète. <Link href={`/competences/${skillId}/fiche`} className="font-bold text-violet-600">Voir la fiche du cours →</Link>
      </section>
    );
  }
  const mine = orals.filter((o) => o.skillId === skillId);
  const upcoming = mine.find((o) => o.status === 'booked' && new Date(o.startsAt).getTime() > now);
  const last = mine.find((o) => o.status === 'done');

  async function book(slot: ExamSlot) {
    if (!window.confirm(`Réserver ton oral le ${whenLabel(slot.startsAt)} (${slot.durationMin} min) ?`)) return;
    const error = await bookOralSlot(profileId, slot.id, skillId);
    setMessage(error ? { ok: false, text: error } : { ok: true, text: 'C’est réservé ! Révise bien, tu vas y arriver.' });
    load();
  }
  async function cancel(oral: LearnerBooking) {
    if (!window.confirm('Annuler ton oral ? Le créneau sera proposé à d’autres élèves.')) return;
    const error = await cancelOral(oral.id);
    setMessage(error ? { ok: false, text: error } : { ok: true, text: 'Oral annulé. Tu peux choisir un autre créneau.' });
    load();
  }

  return (
    <section aria-label="Oral" className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="font-black text-[#1a1a2e]">🎤 Passer l’oral avec un examinateur</h2>
      {last && <OralResult oral={last} />}
      {upcoming ? (
        <div className="rounded-2xl bg-violet-50 p-4 text-sm">
          <p className="font-bold text-violet-900">Ton oral : {whenLabel(upcoming.startsAt)} ({upcoming.durationMin} min)</p>
          {new Date(upcoming.startsAt).getTime() - now > LEARNER_CANCEL_HOURS * HOUR_MS
            ? <button type="button" onClick={() => cancel(upcoming)} className="mt-1 text-xs font-semibold text-slate-500 underline">Annuler (possible jusqu’à {LEARNER_CANCEL_HOURS} h avant)</button>
            : <p className="mt-1 text-xs text-slate-500">Moins de {LEARNER_CANCEL_HOURS} h avant : pour un empêchement, préviens ton centre.</p>}
        </div>
      ) : slots.length === 0 && waiting ? (
        <OralWaitingMessage request={waiting} slotsOpen={false} />
      ) : slots.length === 0 ? (
        <p className="text-sm text-slate-500">Pas de créneau libre pour l’instant dans ton centre : reviens bientôt, les examinateurs en ajoutent régulièrement.</p>
      ) : (
        <div className="space-y-3">
          {waiting && <OralWaitingMessage request={waiting} slotsOpen />}
          <p className="text-sm text-slate-500">Choisis un créneau : l’examinateur évalue ton niveau actuel ; s’il valide, tu passes au niveau suivant.</p>
          {groupByDay(slots, TIME_ZONE).slice(0, 7).map((d) => (
            <div key={d.day}>
              <p className="text-xs font-bold capitalize text-slate-600">{dayLabel(d.day)}</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {d.slots.map((s) => (
                  <li key={s.id}>
                    <button type="button" onClick={() => book(s)} className="rounded-xl border-2 border-violet-200 px-3 py-1.5 text-sm font-bold text-violet-700 hover:border-violet-600">
                      {timeOf(s.startsAt)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {message && <p role={message.ok ? 'status' : 'alert'} className={`text-sm ${message.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{message.text}</p>}
    </section>
  );
}
