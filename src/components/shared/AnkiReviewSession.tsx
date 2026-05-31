'use client';

import React, { useState, useCallback } from 'react';
import type { QuizQuestion, QuizOptionId } from '@/types';
import type { LearningMode } from '@/lib/learning-mode';
import { QuizCard } from '@/components/shared/QuizCard';
import { playSound } from '@/lib/audio';

interface AnkiReviewSessionProps {
  initialQuestions: QuizQuestion[];
  mode: LearningMode;
  onRecord: (questionId: string, isCorrect: boolean) => void;
  onDone: () => void;
}

export function AnkiReviewSession({ initialQuestions, mode, onRecord, onDone }: AnkiReviewSessionProps) {
  const [queue, setQueue] = useState<QuizQuestion[]>([...initialQuestions]);
  const [cardKey, setCardKey] = useState(0);

  const current = queue[0];

  const handleAnswer = useCallback((optionId: QuizOptionId) => {
    if (!current) return;
    const isCorrect = optionId === current.correctOptionId;
    onRecord(current.id, isCorrect);
    playSound(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      setQueue((prev) => {
        const rest = prev.slice(1);
        return isCorrect ? rest : [...rest, prev[0]];
      });
      setCardKey((k) => k + 1);
    }, 1200);
  }, [current, onRecord]);

  if (queue.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-7xl mb-4">🎯</div>
        <h2 className="text-2xl font-black text-[#1a1a2e]">Toutes les erreurs corrigées !</h2>
        <p className="text-slate-500 mt-2 text-sm">Tu as repassé toutes les questions ratées.</p>
        <button onClick={onDone}
          className="mt-6 rounded-2xl bg-emerald-500 text-white font-bold px-8 py-3 hover:bg-emerald-400 transition-colors">
          ← Retour aux résultats
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto px-5 pt-8 pb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[#1a1a2e] font-black text-base">🔁 Révision des erreurs</h2>
          <span className="text-slate-400 text-sm">{queue.length} restante{queue.length > 1 ? 's' : ''}</span>
        </div>
        <div className="flex gap-1.5 mb-5">
          {queue.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${i === 0 ? 'bg-rose-400' : 'bg-rose-100'}`} />
          ))}
        </div>
        <QuizCard key={cardKey} question={current} mode={mode} onAnswer={handleAnswer} />
      </div>
    </div>
  );
}
