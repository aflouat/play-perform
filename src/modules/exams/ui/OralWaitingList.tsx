'use client';

import { useEffect, useState } from 'react';
import { getSkillById } from '@/modules/skills';
import { dropWaitingRequest, fetchWaitingRequests, type WaitingRequest } from '../infra/staffing-client';

const since = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));

/** Notification for the centre: learners ready for their final oral but no examiner available — finding one is the centre's task. */
export function OralWaitingList() {
  const [requests, setRequests] = useState<WaitingRequest[] | null>(null);
  useEffect(() => { fetchWaitingRequests().then(setRequests); }, []);

  async function drop(r: WaitingRequest) {
    if (!window.confirm(`Retirer ${r.studentName} de la liste d’attente (oral organisé autrement) ?`)) return;
    if (!(await dropWaitingRequest(r.id))) setRequests((all) => (all ?? []).filter((x) => x.id !== r.id));
  }

  if (!requests || requests.length === 0) return null;
  return (
    <section aria-label="Oraux en attente d’examinateur" role="alert" className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <h2 className="font-black text-rose-900">⚠️ {requests.length} élève{requests.length > 1 ? 's attendent' : ' attend'} un examinateur pour l’oral final</h2>
      <p className="text-xs text-rose-800">
        Aucun créneau libre dans ton centre : trouve un examinateur disponible — demande à tes examinateurs d’ouvrir des créneaux, ou confie les oraux à un enseignant ci-dessous.
        L’élève voit les créneaux dès qu’ils sont ouverts et la demande se ferme quand il réserve.
      </p>
      <ul className="divide-y divide-rose-100">
        {requests.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-2 text-sm text-rose-950">
            <span className="flex-1"><strong>{r.studentName}</strong> · {getSkillById(r.skillId)?.emoji} {getSkillById(r.skillId)?.name ?? r.skillId}, niveau {r.level}</span>
            <span className="text-xs">depuis {since(r.createdAt)} j</span>
            <button type="button" onClick={() => drop(r)} className="text-xs text-rose-400 hover:text-rose-700">Retirer</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
