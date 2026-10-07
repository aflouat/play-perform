import type { LandingStep } from '../application/useLandingFlow';

const STEPS: { id: LandingStep; label: string }[] = [
  { id: 'mode', label: 'Mode' },
  { id: 'skill', label: 'Compétence' },
  { id: 'test', label: 'Test' },
  { id: 'result', label: 'Résultat' },
];

/** Progress through the 4 steps of the visitor journey. */
export function FlowStepper({ step }: { step: LandingStep }) {
  const current = STEPS.findIndex((s) => s.id === step);
  return (
    <ol className="flex items-start gap-2 mb-6" aria-label="Étapes">
      {STEPS.map((s, i) => (
        <li key={s.id} aria-current={i === current ? 'step' : undefined} className="flex-1">
          <div className={`h-1.5 rounded-full ${i <= current ? 'bg-violet-600' : 'bg-slate-200'}`} />
          <span className={`mt-1.5 block truncate text-[11px] sm:text-xs font-bold ${i === current ? 'text-violet-700' : 'text-slate-500'}`}>
            {i + 1}. {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
