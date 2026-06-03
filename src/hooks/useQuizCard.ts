'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { QuizQuestion, QuizOptionId } from '@/types';
import type { LearningMode } from '@/lib/learning-mode';
import { speakInstruction } from '@/lib/audio';

/**
 * État interne d'une carte quiz. Le composant est remonté via `key={question.id}`
 * à chaque nouvelle question : l'état repart donc neuf, sans effet de reset.
 */
export function useQuizCard(
  question: QuizQuestion,
  mode: LearningMode,
  onAnswer: (optionId: QuizOptionId, timeMs: number) => void,
) {
  const [selected, setSelected] = useState<QuizOptionId | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [eliminatedId, setEliminatedId] = useState<QuizOptionId | null>(null);
  const startMsRef = useRef(0);

  // Au montage uniquement : démarre le chrono + énonce la question en mode assisté.
  useEffect(() => {
    startMsRef.current = Date.now();
    if (mode === 'assisted') speakInstruction(question.questionAssisted ?? question.question);
  }, [mode, question.question, question.questionAssisted]);

  function handleSelect(optionId: QuizOptionId) {
    if (revealed || optionId === eliminatedId) return;
    setSelected(optionId);
    setRevealed(true);
    onAnswer(optionId, Date.now() - startMsRef.current);
  }

  const handleTimeout = useCallback(() => {
    if (revealed) return;
    const wrong = question.options.find((o) => o.id !== question.correctOptionId);
    if (wrong) handleSelect(wrong.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, revealed]);

  function handleHint() {
    if (hintUsed || revealed) return;
    setHintUsed(true);
    if (question.hint) {
      speakInstruction(question.hint);
    } else {
      const wrongs = question.options.filter((o) => o.id !== question.correctOptionId).map((o) => o.id);
      const toEliminate = wrongs[Math.floor(Math.random() * wrongs.length)];
      setEliminatedId(toEliminate);
      speakInstruction(`Indice : la réponse n'est pas ${question.options.find(o => o.id === toEliminate)?.text}`);
    }
  }

  function getOptionStyle(optionId: QuizOptionId): string {
    if (optionId === eliminatedId && !revealed)
      return 'bg-slate-50 border-2 border-slate-100 opacity-30 text-slate-400 cursor-not-allowed line-through';
    if (!revealed) {
      const hl = mode === 'assisted' && optionId === question.correctOptionId && hintUsed ? 'ring-2 ring-amber-300' : '';
      return `bg-white border-2 border-slate-100 hover:border-slate-300 text-[#1a1a2e] ${hl}`;
    }
    if (optionId === question.correctOptionId) return 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700';
    if (optionId === selected) return 'bg-rose-50 border-2 border-rose-400 text-rose-700';
    return 'bg-white border-2 border-slate-100 opacity-40 text-slate-400';
  }

  const getOptionIcon = (id: QuizOptionId) =>
    !revealed ? '' : id === question.correctOptionId ? '✓' : id === selected ? '✕' : '';

  return { selected, revealed, hintUsed, eliminatedId, handleSelect, handleTimeout, handleHint, getOptionStyle, getOptionIcon };
}
