'use client';

import Link from 'next/link';
import { getSkillById, getSkillLevel } from '@/modules/skills';
import { getPlacementTest, reviewAnswers } from '@/modules/quizzes';
import { useSavedPlacements } from '../infra/placement-storage';

const LETTERS = ['A', 'B', 'C', 'D'];

/** Question-by-question feedback on a placement test taken without an account. */
export function PlacementReview({ skillId }: { skillId: string }) {
  const saved = useSavedPlacements()[skillId];
  const skill = getSkillById(skillId);
  if (!skill) return <p className="text-center text-slate-500">Compétence introuvable.</p>;

  if (!saved?.answers) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center shadow-sm border border-slate-200">
        <p className="text-slate-600">Pas de réponses enregistrées pour {skill.name} sur cet appareil.</p>
        <Link href="/#commencer" className="mt-4 inline-flex rounded-2xl bg-violet-600 px-5 py-3 font-bold text-white">Passer le test de niveau</Link>
      </div>
    );
  }

  const review = reviewAnswers(getPlacementTest(skillId), saved.answers);
  const toWork = review.filter((e) => !e.correct);
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-black text-slate-900">{skill.emoji} Mes réponses · {skill.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {saved.correct}/{saved.total} bonnes réponses · départ au niveau {saved.startLevel} ({getSkillLevel(saved.startLevel).label})
        </p>
        {toWork.length > 0 && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          À retravailler : {toWork.map((e) => `niveau ${e.question.level}`).join(', ')}.
        </p>}
      </header>

      <ol className="space-y-3">
        {review.map((entry, i) => (
          <li key={entry.question.id} className={`rounded-2xl border-2 p-4 ${entry.correct ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
            <p className="text-xs font-bold text-slate-500">Question {i + 1} · niveau {entry.question.level}</p>
            <p className="mt-1 font-bold text-slate-900">{entry.question.prompt}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {entry.question.options.map((option, k) => {
                const right = k === entry.question.correctIndex;
                const picked = k === entry.chosenIndex;
                return (
                  <li key={option} className={right ? 'font-bold text-emerald-800' : picked ? 'font-bold text-rose-800' : 'text-slate-600'}>
                    {LETTERS[k]}. {option}{right ? ' ✓ bonne réponse' : picked ? ' ✗ ta réponse' : ''}
                  </li>
                );
              })}
            </ul>
            {entry.skipped && <p className="mt-2 text-sm font-semibold text-slate-600">Tu as répondu « Je ne sais pas » : la bonne réponse est {entry.correctText}.</p>}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4">
        <p className="font-bold text-slate-900">Progresser sur cette compétence</p>
        <p className="mt-1 text-sm text-slate-600">Crée un compte pour travailler ces notions avec des quiz, des flashcards et des évaluations corrigées.</p>
        <Link href="/auth?signup=1" className="mt-3 block rounded-xl bg-violet-600 px-5 py-3 text-center font-bold text-white">Créer un compte</Link>
      </div>
    </div>
  );
}
