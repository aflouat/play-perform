'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { describeEvent, fetchFeed, sendCheer, type FeedEvent } from '@/modules/competition';
import { fetchDistributions } from '@/modules/community';
import { getSkillBank } from '@/modules/skills';
import { trapAlerts, type TrapAlert } from '../domain/scorecard';

const FEED_SIZE = 5;

/** Compact social feed of the command center: the centre's successes (with "Bravo") and anonymous classic mistakes of the current courses. */
export function LearnerFeed({ profileId, skillIds }: { profileId: string; skillIds: string[] }) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [alerts, setAlerts] = useState<TrapAlert[]>([]);
  const skillsKey = skillIds.join(',');

  useEffect(() => {
    let alive = true;
    fetchFeed(profileId).then((all) => { if (alive) setEvents(all.slice(0, FEED_SIZE)); });
    return () => { alive = false; };
  }, [profileId]);

  useEffect(() => {
    let alive = true;
    const banks = skillsKey.split(',').filter(Boolean).map((id) => ({ id, questions: getSkillBank(id).slice(0, 20) }));
    fetchDistributions(banks.flatMap((b) => b.questions.map((q) => q.id))).then((d) => {
      if (alive) setAlerts(banks.flatMap((b) => trapAlerts(b.questions, d, b.id, 1)).slice(0, 2));
    });
    return () => { alive = false; };
  }, [skillsKey]);

  async function cheer(event: FeedEvent) {
    setEvents((all) => all.map((e) => (e.id === event.id ? { ...e, cheeredByMe: true, cheers: e.cheers + 1 } : e))); // optimistic
    if (!(await sendCheer(profileId, event.id))) fetchFeed(profileId).then((all) => setEvents(all.slice(0, FEED_SIZE)));
  }

  return (
    <section aria-label="Fil d’interactions" className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="font-black text-[#1a1a2e]">📣 Dans mon centre</h2>
      {events.length === 0 && alerts.length === 0 && <p className="text-xs text-slate-500">Pas encore d’activité. La première réussite sera la tienne ?</p>}
      <ul className="space-y-2">
        {alerts.map((a) => (
          <li key={a.questionId} className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-900">
            <p><strong>Erreur classique détectée :</strong> {a.wrong} élèves se sont trompés sur « {a.question} ».</p>
            <Link href={`/competences/${a.skillId}`} className="mt-1 inline-block font-bold text-amber-700 underline">Voir la leçon</Link>
          </li>
        ))}
        {events.map((e) => (
          <li key={e.id} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
            <p className="flex-1">{describeEvent(e)}</p>
            {!e.isMine && (
              <button onClick={() => cheer(e)} disabled={e.cheeredByMe} aria-label={`Bravo à ${e.nickname}`}
                className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 font-black text-amber-800 disabled:opacity-60">
                👏{e.cheers > 0 ? ` ${e.cheers}` : ''}
              </button>
            )}
          </li>
        ))}
      </ul>
      <Link href="/classement" className="block text-xs font-bold text-violet-600">Tout le fil et le classement →</Link>
    </section>
  );
}
