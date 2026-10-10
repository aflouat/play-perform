import { getSkills, isGeneralSkill } from '@/modules/skills';
import type { SavedPlacement } from '../infra/placement-storage';

interface Props {
  saved: Record<string, SavedPlacement>;
  onChoose: (skillId: string) => void;
  onChangeMode: () => void;
}

/** Step 2: pick the skill to acquire. Shows the level already measured on this device. */
export function SkillPicker({ saved, onChoose, onChangeMode }: Props) {
  return (
    <div>
      <h2 id="flow-title" tabIndex={-1} className="text-2xl font-black text-slate-900 outline-none">Quelle compétence veux-tu acquérir ?</h2>
      <p className="mt-1 text-slate-600 text-sm">5 questions de plus en plus difficiles pour trouver ton point de départ.</p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {getSkills().filter(isGeneralSkill).map((skill) => {
          const previous = saved[skill.id];
          return (
            <li key={skill.id}>
              <button type="button" onClick={() => onChoose(skill.id)}
                className="group w-full h-full text-left flex gap-4 rounded-2xl bg-white border-2 border-slate-200 p-4 hover:border-violet-500 hover:shadow-md transition-all focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-300">
                <span aria-hidden="true" className="text-3xl shrink-0 w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform motion-reduce:transition-none">
                  {skill.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase tracking-wide text-violet-700">{skill.domain}</span>
                  <span className="block font-black text-slate-900">{skill.name}</span>
                  <span className="block text-sm text-slate-600 mt-0.5">{skill.description}</span>
                  {previous && (
                    <span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                      Déjà testé · niveau {previous.startLevel}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={onChangeMode} className="mt-4 text-sm font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900">
        ← Changer de mode
      </button>
    </div>
  );
}
