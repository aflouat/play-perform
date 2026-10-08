import type { Skill, SkillLevelNumber } from '../domain/skill';
import { buildingFor } from '../domain/dashboard';

interface Props {
  skill: Skill;
  level: SkillLevelNumber | null;
  selected: boolean;
  onSelect: () => void;
}

/** One lot of the learner's town: the building grows with the skill level. */
export function BuildingTile({ skill, level, selected, onSelect }: Props) {
  const building = buildingFor(level);
  return (
    <button onClick={onSelect} aria-pressed={selected} aria-label={`${skill.name} : ${building.label}, niveau ${level ?? 0} sur 5`}
      className={`flex flex-col items-center rounded-3xl border-2 p-3 text-center transition-all ${
        selected ? 'border-violet-600 bg-violet-50 shadow-lg scale-[1.03]' : 'border-emerald-200 bg-emerald-50/60 hover:border-violet-300'}`}>
      <span className="text-5xl leading-none" aria-hidden>{building.emoji}</span>
      <span className="mt-1 text-xl" aria-hidden>{skill.emoji}</span>
      <span className="mt-1 text-xs font-black leading-tight text-[#1a1a2e]">{skill.name}</span>
      <span className="mt-1 text-[10px] font-bold text-violet-600">{level ?? 0} / 5</span>
    </button>
  );
}
