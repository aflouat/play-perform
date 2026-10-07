'use client';

import { useEffect, useRef } from 'react';
import { getSkillLevel, type Skill } from '@/modules/skills';
import type { PlacementQuestion } from '@/modules/quizzes';

interface Props {
  skill: Skill;
  question: PlacementQuestion;
  index: number;
  total: number;
  onAnswer: (chosenIndex: number | null) => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

/** Step 3: one question per level, no feedback per question (it is a placement, not a grade). */
export function PlacementTest({ skill, question, index, total, onAnswer }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new question so keyboard and screen-reader users follow along
  useEffect(() => { headingRef.current?.focus(); }, [question.id]);

  const level = getSkillLevel(question.level);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-slate-900"><span aria-hidden="true">{skill.emoji}</span> {skill.name}</p>
        <p className="text-sm font-semibold text-slate-600">Question {index + 1}/{total}</p>
      </div>
      <div role="progressbar" aria-label="Progression du test" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index}
        className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full bg-violet-600 transition-all motion-reduce:transition-none" style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <div className="mt-6 rounded-3xl bg-white shadow-lg border border-slate-100 p-5 sm:p-7">
        <p className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
          Niveau {question.level} · {level.label}
        </p>
        <h2 id="flow-title" ref={headingRef} tabIndex={-1} className="mt-3 text-xl sm:text-2xl font-black text-slate-900 outline-none">
          {question.prompt}
        </h2>

        <div className="mt-5 grid gap-2.5" role="group" aria-label="Réponses">
          {question.options.map((option, i) => (
            <button key={option} type="button" onClick={() => onAnswer(i)}
              className="flex items-center gap-3 w-full text-left rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 font-semibold text-slate-800 hover:border-violet-500 hover:bg-violet-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-300 transition-colors">
              <span aria-hidden="true" className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-black text-slate-600">
                {LETTERS[i]}
              </span>
              {option}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => onAnswer(null)}
          className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
          Je ne sais pas
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Pas de note ici : mieux vaut « Je ne sais pas » que répondre au hasard.</p>
    </div>
  );
}
