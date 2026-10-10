'use client';

import { getSkills } from '@/modules/skills';
import type { RoadmapCourse } from '../domain/roadmap';
import type { PathPhase } from '../domain/training-path';
import { ChapterEditor } from './ChapterEditor';

/** One generic phase of a path in the editor: its duration and its ordered chapters. */
export function PhaseEditor({ number, title, phase, onChange }: { number: number; title: string; phase: PathPhase; onChange: (p: PathPhase) => void }) {
  const setChapters = (chapters: RoadmapCourse[]) => onChange({ ...phase, chapters });
  const replace = (i: number, c: RoadmapCourse) => setChapters(phase.chapters.map((old, j) => (j === i ? c : old)));
  const moveUp = (i: number) => { const next = [...phase.chapters]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; setChapters(next); };

  return (
    <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <legend className="px-1 font-black text-[#1a1a2e]">Phase {number} · {title}</legend>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        Durée
        <input type="number" min={1} max={52} value={phase.weeks} aria-label={`Durée de la phase ${title} en semaines`}
          onChange={(e) => onChange({ ...phase, weeks: Number(e.target.value) })} className="w-20 rounded-lg border border-slate-200 px-2 py-1" />
        semaines
      </label>
      <ol className="space-y-2">
        {phase.chapters.map((c, i) => (
          <ChapterEditor key={i} chapter={c} index={i} onChange={(next) => replace(i, next)}
            onRemove={() => setChapters(phase.chapters.filter((_, j) => j !== i))} onUp={i > 0 ? () => moveUp(i) : null} />
        ))}
      </ol>
      <button type="button" onClick={() => setChapters([...phase.chapters, { title: '', skillId: getSkills()[0].id, targetLevel: 1 }])}
        className="text-sm font-bold text-violet-600">+ Ajouter un chapitre</button>
    </fieldset>
  );
}
