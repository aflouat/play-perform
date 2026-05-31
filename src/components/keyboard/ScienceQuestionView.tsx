'use client';

import React, { useState, useEffect } from 'react';
import type { ScienceQuestion } from '@/lib/science-data';
import { playSound, speakEnthusiastic, speakInstruction } from '@/lib/audio';
import { HintButton } from '@/components/ui/HintButton';
import type { LearningMode } from '@/lib/learning-mode';

interface Props {
  question: ScienceQuestion;
  mode: LearningMode;
  isLast: boolean;
  onAnswered: (isCorrect: boolean) => void;
  onNext: () => void;
}

/**
 * Vue d'une question Sciences. Montée via key={question.id} : l'état (réponse
 * choisie, indice) repart neuf à chaque question, sans effet de reset.
 */
export function ScienceQuestionView({ question, mode, isLast, onAnswered, onNext }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [eliminatedIdx, setEliminatedIdx] = useState<number | null>(null);

  // Au montage : énonce la question en mode assisté.
  useEffect(() => {
    if (mode === 'assisted') speakInstruction(question.question);
  }, [mode, question.question]);

  function handleSelect(optionIdx: number) {
    if (revealed || optionIdx === eliminatedIdx) return;
    setSelected(optionIdx);
    setRevealed(true);
    const isCorrect = optionIdx === question.correctIndex;
    if (isCorrect) {
      playSound('correct'); speakEnthusiastic(question.explanation);
    } else {
      playSound('wrong'); speakInstruction(question.explanation);
    }
    onAnswered(isCorrect);
  }

  function handleHint() {
    if (hintUsed || revealed) return;
    setHintUsed(true);
    const wrongs = question.options.map((_, i) => i).filter(i => i !== question.correctIndex);
    setEliminatedIdx(wrongs[Math.floor(Math.random() * wrongs.length)]);
    speakInstruction(`Indice : pense à ce qui se passe dehors tous les jours. ${question.question}`);
  }

  function optionStyle(i: number): string {
    if (i === eliminatedIdx && !revealed) return 'bg-slate-50 border-2 border-slate-100 opacity-30 line-through text-slate-300 cursor-not-allowed';
    if (!revealed) return `bg-white border-2 border-slate-100 hover:border-sky-300 hover:shadow-md ${mode === 'assisted' ? 'py-5' : ''}`;
    if (i === question.correctIndex) return 'bg-emerald-50 border-2 border-emerald-400';
    if (i === selected) return 'bg-rose-50 border-2 border-rose-400';
    return 'bg-white border-2 border-slate-100 opacity-40';
  }

  return (
    <>
      <div className={`rounded-3xl bg-white shadow-xl p-6 text-center ${mode === 'assisted' ? 'border-2 border-violet-100' : ''}`}>
        <div className={mode === 'assisted' ? 'text-7xl mb-3' : 'text-6xl mb-3'}>{question.emoji}</div>
        <p className={`text-[#1a1a2e] font-bold leading-snug ${mode === 'assisted' ? 'text-xl' : 'text-lg'}`}>{question.question}</p>
        {mode === 'assisted' && (
          <button onClick={() => speakInstruction(question.question)}
            className="mt-3 rounded-xl bg-violet-50 border border-violet-200 px-4 py-2 text-violet-500 text-sm font-semibold hover:bg-violet-100 transition-colors">
            🔊 Écouter
          </button>
        )}
      </div>

      {mode === 'assisted' && !revealed && (
        <div className="flex justify-center">
          <HintButton onHint={handleHint} used={hintUsed} />
        </div>
      )}

      {hintUsed && !revealed && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-amber-700 text-sm flex items-center gap-2">
          <span>💡</span><span>Une mauvaise réponse est barrée. Réfléchis bien !</span>
        </div>
      )}

      <div className="space-y-2.5">
        {question.options.map((opt, i) => (
          <button key={i} onClick={() => handleSelect(i)} disabled={revealed || i === eliminatedIdx}
            className={`w-full rounded-2xl p-4 text-left font-semibold text-[#1a1a2e] transition-all duration-200 flex items-center gap-3 ${optionStyle(i)}`}>
            <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-500 shrink-0">
              {revealed && i === question.correctIndex ? '✓' : revealed && i === selected ? '✕' : ['A', 'B', 'C'][i]}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {revealed && (
        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4">
          <p className="text-sky-700 text-sm font-semibold mb-1">{question.explanation}</p>
          <p className="text-sky-600 text-xs">{question.fact}</p>
          <button onClick={onNext} className="mt-3 w-full rounded-xl bg-sky-500 py-3 font-bold text-white shadow hover:bg-sky-400 transition-colors">
            {isLast ? 'Terminer !' : 'Question suivante →'}
          </button>
        </div>
      )}
    </>
  );
}
