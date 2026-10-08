import { SKILL_LEVELS, type SkillLevelNumber } from '../domain/skill';
import { masteryPercent } from '../domain/dashboard';

interface Props {
  /** null = never evaluated: shown as level 1 to confirm */
  level: SkillLevelNumber | null;
}

/** Progress bar towards mastery (level 5), with the 5 steps of the path and the current level highlighted. */
export function SkillLevelMeter({ level }: Props) {
  const current = level ?? 1;
  const info = SKILL_LEVELS[current - 1];
  const percent = masteryPercent(level);
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-violet-700">Niveau {current} sur 5 · {info.label}</span>
        <span className="text-slate-500">{level === 5 ? '🏆 maîtrise atteinte' : `${percent} % de la maîtrise`}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={percent} aria-label="Progression vers la maîtrise">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700" style={{ width: `${percent}%` }} />
      </div>
      <ol className="mt-1.5 flex justify-between text-[10px] text-slate-400" aria-hidden>
        {SKILL_LEVELS.map((l) => <li key={l.n} className={l.n === current ? 'font-black text-violet-600' : ''}>{l.n}</li>)}
      </ol>
      <p className="mt-1 text-xs text-slate-500">{level === null ? 'Pas encore évalué — ' : ''}{info.description}</p>
    </div>
  );
}
