import type { TrainingPath } from '@/modules/dashboards';
import { GENERIC_PHASES } from '@/modules/dashboards';

/** The training paths the centre offers (common catalogue): 4 phases, their chapters and the total duration. */
export function PathsOffer({ paths }: { paths: readonly TrainingPath[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {paths.map((p) => {
        const weeks = GENERIC_PHASES.reduce((sum, ph) => sum + p.phases[ph.id].weeks, 0);
        return (
          <li key={p.id} className="flex flex-col rounded-3xl bg-white p-5 shadow-sm">
            <span aria-hidden="true" className="text-4xl">{p.emoji}</span>
            <h3 className="mt-2 text-lg font-black text-[#1a1a2e]">{p.name}</h3>
            <p className="text-sm text-slate-600">{p.description}</p>
            <ol className="mt-3 flex-1 space-y-1 text-xs text-slate-600">
              {GENERIC_PHASES.map((ph, i) => (
                <li key={ph.id}><strong className="text-violet-700">{i + 1}. {ph.title}</strong> · {p.phases[ph.id].chapters.map((c) => c.title).slice(0, 2).join(', ')}{p.phases[ph.id].chapters.length > 2 ? '…' : ''}</li>
              ))}
            </ol>
            <p className="mt-3 text-xs font-bold text-slate-500">≈ {weeks} semaines à ton rythme</p>
          </li>
        );
      })}
    </ul>
  );
}
