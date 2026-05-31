'use client';

import React, { useState, useCallback } from 'react';
import { getScienceQuestions, type ScienceQuestion } from '@/lib/science-data';
import { playSound } from '@/lib/audio';
import { useScore } from '@/hooks/useScore';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { ScienceQuestionView } from '@/components/keyboard/ScienceQuestionView';
import type { LearningMode } from '@/lib/learning-mode';

interface Props { profileId: string; mode: LearningMode; onFinish: () => void; }

export function ScienceMode({ profileId, mode, onFinish }: Props) {
  const [questions] = useState<ScienceQuestion[]>(() => getScienceQuestions(5));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const { addXp } = useScore(profileId);
  const { lastGain, popKey, triggerGain } = useXpGain();

  const current = questions[idx];

  const handleAnswered = useCallback((isCorrect: boolean) => {
    if (!isCorrect) return;
    addXp(15, 'quiz-correct'); triggerGain(15); setScore(s => s + 1);
  }, [addXp, triggerGain]);

  const handleNext = useCallback(() => {
    if (idx < questions.length - 1) setIdx(i => i + 1);
    else { playSound('complete'); onFinish(); }
  }, [idx, questions.length, onFinish]);

  if (!current) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      <XpGainToast gain={lastGain} />

      <div className="flex justify-between items-center">
        <div className={`text-3xl font-black text-sky-500 score-pop`} key={popKey}>{score}/{questions.length}</div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full w-8 ${i < idx ? 'bg-sky-400' : i === idx ? 'bg-sky-200' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      <ScienceQuestionView key={current.id} question={current} mode={mode}
        isLast={idx >= questions.length - 1} onAnswered={handleAnswered} onNext={handleNext} />
    </div>
  );
}
