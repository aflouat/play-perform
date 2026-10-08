import type { ReviewSummary } from '../domain/dashboard';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

/** Past and upcoming reviews of a skill. */
export function ReviewsSummary({ reviews }: { reviews: ReviewSummary }) {
  if (reviews.studied === 0) {
    return <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Aucune révision pour l’instant : fais un quiz ou des flashcards pour lancer ton planning.</p>;
  }
  return (
    <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
      <p><strong>Déjà vu :</strong> {reviews.studied} question{reviews.studied > 1 ? 's' : ''}
        {reviews.lastStudiedAt && <> · dernière révision {fmt(reviews.lastStudiedAt)}</>}</p>
      {reviews.dueNow > 0 && <p className="font-bold text-amber-700">⏰ {reviews.dueNow} à réviser maintenant</p>}
      {reviews.upcoming.length > 0 && (
        <div>
          <p className="font-bold">À venir</p>
          <ul className="mt-0.5 space-y-0.5">
            {reviews.upcoming.slice(0, 4).map((u) => <li key={u.day}>{fmt(u.day)} · {u.count} question{u.count > 1 ? 's' : ''}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
