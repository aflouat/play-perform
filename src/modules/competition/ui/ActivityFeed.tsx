'use client';

import { useCallback, useEffect, useState } from 'react';
import { describeEvent } from '../domain/feed';
import { fetchFeed, hideFeedEvent, sendCheer, type FeedEvent } from '../infra/competition-client';

const when = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

/** Live feed of the centre's successes and the wall of trophies (masteries). Pseudonyms only; a teacher can remove an item. */
export function ActivityFeed({ profileId, moderator = false }: { profileId: string; moderator?: boolean }) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const load = useCallback(() => { fetchFeed(profileId).then(setEvents); }, [profileId]);
  useEffect(load, [load]);

  async function cheer(event: FeedEvent) {
    setEvents((all) => all.map((e) => (e.id === event.id ? { ...e, cheeredByMe: true, cheers: e.cheers + 1 } : e))); // optimistic
    if (!(await sendCheer(profileId, event.id))) load();
  }
  async function remove(event: FeedEvent) {
    if (window.confirm('Retirer cette réussite du fil ?') && (await hideFeedEvent(event.id))) load();
  }

  const trophies = events.filter((e) => e.level >= 5);
  return (
    <div className="space-y-6">
      <section aria-label="Fil d’activité" className="space-y-2">
        <h2 className="font-black text-[#1a1a2e]">📣 Les réussites du centre</h2>
        {events.length === 0 && <p className="text-sm text-slate-500">Pas encore de réussite à fêter. La première sera la tienne ?</p>}
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm shadow-sm">
              <p className="flex-1 text-slate-700">{describeEvent(e)} <span className="text-xs text-slate-400">· {when(e.createdAt)}</span></p>
              {!e.isMine && (
                <button onClick={() => cheer(e)} disabled={e.cheeredByMe} aria-label={`Bravo à ${e.nickname}`}
                  className="shrink-0 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-800 disabled:opacity-60">
                  👏 Bravo{e.cheers > 0 ? ` · ${e.cheers}` : ''}
                </button>
              )}
              {e.isMine && e.cheers > 0 && <span className="shrink-0 text-xs font-bold text-amber-700">👏 {e.cheers}</span>}
              {moderator && <button onClick={() => remove(e)} className="shrink-0 text-xs text-slate-300 hover:text-rose-500" aria-label="Retirer du fil">×</button>}
            </li>
          ))}
        </ul>
      </section>
      {trophies.length > 0 && (
        <section aria-label="Mur des trophées" className="space-y-2">
          <h2 className="font-black text-[#1a1a2e]">🏆 Mur des trophées</h2>
          <ul className="grid grid-cols-2 gap-2">
            {trophies.map((e) => (
              <li key={e.id} className="rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 p-3 text-center text-sm">
                <p className="text-3xl" aria-hidden="true">{e.skillEmoji}</p>
                <p className="font-black text-amber-900">{e.nickname}</p>
                <p className="text-xs text-amber-800">maîtrise {e.skillName}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
