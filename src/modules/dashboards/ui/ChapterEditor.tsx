'use client';

import { getSkills, SKILL_LEVELS, type SkillLevelNumber } from '@/modules/skills';
import type { RoadmapCourse } from '../domain/roadmap';

const input = 'rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm';
const SKILLS = getSkills();

function SkillSelect({ value, onChange, label }: { value: string; onChange: (id: string) => void; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${input} min-w-0 flex-1`}>
      {SKILLS.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}{s.trade ? ` (métier : ${s.trade})` : ''}</option>)}
    </select>
  );
}

function LevelSelect({ value, onChange, label }: { value: SkillLevelNumber; onChange: (n: SkillLevelNumber) => void; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(Number(e.target.value) as SkillLevelNumber)} className={input}>
      {SKILL_LEVELS.map((l) => <option key={l.n} value={l.n}>Niv. {l.n} · {l.label}</option>)}
    </select>
  );
}

interface Props { chapter: RoadmapCourse; index: number; onChange: (c: RoadmapCourse) => void; onRemove: () => void; onUp: (() => void) | null }

/** One chapter of a phase: pedagogical title, skill and target level, optional minimum level in another skill. */
export function ChapterEditor({ chapter, index, onChange, onRemove, onUp }: Props) {
  const n = index + 1;
  return (
    <li className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex gap-2">
        <input aria-label={`Titre du chapitre ${n}`} value={chapter.title} onChange={(e) => onChange({ ...chapter, title: e.target.value })}
          placeholder="ex. Préparer une solution et calculer une concentration" className={`${input} min-w-0 flex-1 font-semibold`} />
        {onUp && <button type="button" onClick={onUp} aria-label={`Monter le chapitre ${n}`} className="px-2 text-slate-400 hover:text-violet-600">↑</button>}
        <button type="button" onClick={onRemove} aria-label={`Retirer le chapitre ${n}`} className="px-2 text-slate-400 hover:text-rose-600">✕</button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        Compétence <SkillSelect label={`Compétence du chapitre ${n}`} value={chapter.skillId} onChange={(skillId) => onChange({ ...chapter, skillId })} />
        à amener au <LevelSelect label={`Niveau visé du chapitre ${n}`} value={chapter.targetLevel} onChange={(targetLevel) => onChange({ ...chapter, targetLevel })} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={Boolean(chapter.requires)}
            onChange={(e) => onChange({ ...chapter, requires: e.target.checked ? { skillId: SKILLS.find((s) => s.id !== chapter.skillId)?.id ?? '', level: 1 } : undefined })} />
          Niveau minimum requis
        </label>
        {chapter.requires && (<>
          <SkillSelect label={`Compétence requise du chapitre ${n}`} value={chapter.requires.skillId}
            onChange={(skillId) => onChange({ ...chapter, requires: { level: chapter.requires?.level ?? 1, skillId } })} />
          <LevelSelect label={`Niveau requis du chapitre ${n}`} value={chapter.requires.level}
            onChange={(level) => onChange({ ...chapter, requires: { skillId: chapter.requires?.skillId ?? '', level } })} />
        </>)}
      </div>
    </li>
  );
}
