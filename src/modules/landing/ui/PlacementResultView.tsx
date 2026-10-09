'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { SKILL_LEVELS, getSkillLevel, type Skill } from '@/modules/skills';
import type { PlacementResult } from '@/modules/quizzes';

interface Props {
  skill: Skill;
  result: PlacementResult;
  onAnotherSkill: () => void;
}

/** Step 4: starting level on the 1 → 5 path, then conversion CTA. */
export function PlacementResultView({ skill, result, onAnotherSkill }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  const start = getSkillLevel(result.startLevel);

  return (
    <div className="rounded-3xl bg-white shadow-lg border border-slate-100 p-5 sm:p-7 text-center">
      <div aria-hidden="true" className="text-6xl level-up">{result.mastered ? '🏆' : '🎉'}</div>
      <h2 id="flow-title" ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-black text-slate-900 outline-none">
        {result.mastered ? 'Impressionnant, sans faute !' : 'Test terminé, bravo !'}
      </h2>
      <p className="mt-2 text-slate-700">
        Ton point de départ en <strong>{skill.name}</strong> :{' '}
        <strong className="text-violet-700">niveau {start.n} · {start.label}</strong>
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {result.correct}/{result.total} bonnes réponses{result.skipped > 0 ? ` · ${result.skipped} « Je ne sais pas »` : ''}
      </p>

      <ol className="mt-6 flex justify-between gap-1 text-left" aria-label="Ton parcours en 5 niveaux">
        {SKILL_LEVELS.map((level) => {
          const acquired = level.n < result.startLevel;
          const current = level.n === result.startLevel;
          return (
            <li key={level.n} className="flex-1 flex flex-col items-center text-center"
              aria-label={`Niveau ${level.n}, ${level.label} : ${acquired ? 'acquis' : current ? 'tu commences ici' : 'à venir'}`}>
              <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
                acquired ? 'bg-violet-600 text-white' : current ? 'bg-amber-400 text-violet-950 ring-4 ring-amber-200' : 'bg-slate-100 text-slate-500'}`}>
                {acquired ? '✓' : level.n}
              </span>
              <span className={`mt-1.5 hidden sm:block text-[11px] leading-tight font-bold ${current ? 'text-violet-800' : 'text-slate-500'}`}>{level.label}</span>
            </li>
          );
        })}
      </ol>

      <Link href={`/test-de-niveau/${skill.id}`}
        className="mt-6 block rounded-xl border-2 border-violet-200 px-5 py-3 font-bold text-violet-800 hover:bg-violet-50">
        📝 Revoir mes réponses et le feedback
      </Link>

      <div className="mt-4 rounded-2xl bg-violet-50 border border-violet-200 p-4 text-left">
        <p className="font-bold text-slate-900">Garde ta progression</p>
        <p className="mt-1 text-sm text-slate-600">
          Ton résultat est enregistré sur cet appareil. Crée un compte gratuit pour le retrouver partout et suivre ton parcours.
        </p>
        <Link href="/auth?signup=1"
          className="mt-3 block rounded-xl bg-violet-600 px-5 py-3 text-center font-bold text-white hover:bg-violet-700">
          Sauvegarder ma progression
        </Link>
      </div>
      <button type="button" onClick={onAnotherSkill}
        className="mt-3 w-full rounded-xl border-2 border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
        Tester une autre compétence
      </button>
    </div>
  );
}
