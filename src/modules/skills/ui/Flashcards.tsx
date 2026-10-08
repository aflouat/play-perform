'use client';

import { useState } from 'react';
import type { Flashcard } from '../infra/skill-content';

interface Props {
  cards: Flashcard[];
  /** Called once when the last card has been seen */
  onFinish: (known: number, total: number) => void;
}

/** Flip-through deck: read the question, reveal the answer, say if it was known. */
export function Flashcards({ cards, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);
  const card = cards[index];

  function next(wasKnown: boolean) {
    const total = known + (wasKnown ? 1 : 0);
    setKnown(total);
    setRevealed(false);
    if (index >= cards.length - 1) { setDone(true); onFinish(total, cards.length); }
    else setIndex(index + 1);
  }

  if (done) {
    return <p role="status" className="rounded-2xl bg-sky-50 p-4 text-center font-bold text-sky-700">
      {known}/{cards.length} cartes connues. Les autres reviendront dans tes révisions.</p>;
  }
  return (
    <div>
      <p className="mb-3 text-xs font-bold text-slate-400">Carte {index + 1} / {cards.length}</p>
      <div className="rounded-3xl bg-white p-6 shadow border border-slate-200 min-h-48">
        <p className="font-bold text-[#1a1a2e]">{card.front}</p>
        {revealed && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="font-black text-violet-700">{card.back}</p>
            <p className="mt-2 text-sm text-slate-500">{card.explanation}</p>
          </div>
        )}
      </div>
      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="mt-4 w-full rounded-2xl bg-violet-600 py-3 font-bold text-white">Voir la réponse</button>
      ) : (
        <div className="mt-4 flex gap-3">
          <button onClick={() => next(false)} className="flex-1 rounded-2xl bg-amber-100 py-3 font-bold text-amber-800">À revoir</button>
          <button onClick={() => next(true)} className="flex-1 rounded-2xl bg-emerald-500 py-3 font-bold text-white">Je savais</button>
        </div>
      )}
    </div>
  );
}
