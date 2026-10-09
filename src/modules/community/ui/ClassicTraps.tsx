'use client';

import { useEffect, useState } from 'react';
import type { QuizQuestion } from '@/types';
import { rankTraps, type ClassicTrap } from '../domain/traps';
import { fetchDistributions } from '../infra/community-client';

/** "Les pièges classiques de ce niveau": where many learners go wrong, so that nobody feels alone with a mistake. */
export function ClassicTraps({ questions }: { questions: QuizQuestion[] }) {
  const [traps, setTraps] = useState<ClassicTrap[]>([]);
  useEffect(() => {
    let alive = true;
    fetchDistributions(questions.slice(0, 20).map((q) => q.id)).then((d) => { if (alive) setTraps(rankTraps(questions, d)); });
    return () => { alive = false; };
  }, [questions]);

  if (traps.length === 0) return null;
  return (
    <section aria-label="Pièges classiques" className="space-y-2 rounded-3xl bg-amber-50 p-5">
      <h2 className="font-black text-amber-900">🪤 Les pièges classiques de ce niveau</h2>
      <p className="text-xs text-amber-800">Beaucoup d’élèves tombent dedans : ce n’est pas toi le problème, c’est le piège !</p>
      <ul className="space-y-3">
        {traps.map((t) => (
          <li key={t.question.id} className="rounded-2xl bg-white p-3 text-sm">
            <p className="font-bold text-[#1a1a2e]">{t.question.question}</p>
            <p className="mt-1 text-slate-600">{t.summary.trap?.share} % ont répondu « {t.trapOptionText} », mais c’est « <strong>{t.correctOptionText}</strong> » : {t.question.explanation}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
