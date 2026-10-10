import type { MyOralRequest } from '../infra/staffing-client';

const day = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

/** The learner of the final oral phase: on the waiting list (no examiner yet), or good news once slots have opened. */
export function OralWaitingMessage({ request, slotsOpen }: { request: MyOralRequest; slotsOpen: boolean }) {
  if (slotsOpen) {
    return <p role="status" className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">🎉 Bonne nouvelle : des créneaux viennent d’ouvrir pour ton oral final. Choisis le tien !</p>;
  }
  return (
    <div role="status" className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-bold">⏳ Tu es en liste d’attente pour ton oral final</p>
      <p className="mt-1">Aucun examinateur n’est disponible pour l’instant. Ton centre est prévenu et s’occupe de t’en trouver un : les créneaux apparaîtront ici dès qu’ils seront ouverts. En attendant, continue tes révisions !</p>
      <p className="mt-1 text-xs opacity-70">En attente depuis le {day(request.createdAt)}</p>
    </div>
  );
}
