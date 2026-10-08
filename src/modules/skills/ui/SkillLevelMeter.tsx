import { SKILL_LEVELS, type SkillLevelNumber } from '../domain/skill';

interface Props {
  /** null = never evaluated: shown as level 1 to confirm */
  level: SkillLevelNumber | null;
}

/** The 5-step path of a skill, with the learner's current level highlighted. */
export function SkillLevelMeter({ level }: Props) {
  const current = level ?? 1;
  const info = SKILL_LEVELS[current - 1];
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-violet-700">Niveau {current} · {info.label}</span>
        {level === null && <span className="text-slate-400 font-medium">pas encore évalué</span>}
        {level === 5 && <span className="text-emerald-600">🏆 palier maximal</span>}
      </div>
      <div className="mt-1.5 flex gap-1" role="img" aria-label={`Niveau ${current} sur 5`}>
        {SKILL_LEVELS.map((l) => (
          <span key={l.n} className={`h-2 flex-1 rounded-full ${l.n < current ? 'bg-violet-500' : l.n === current ? 'bg-violet-400 ring-2 ring-violet-200' : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-slate-500">{info.description}</p>
    </div>
  );
}
