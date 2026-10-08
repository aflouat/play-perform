'use client';

import { useState } from 'react';
import type { QuizOptionId, QuizQuestion } from '@/types';
import { QuizCard } from '@/components/shared/QuizCard';
import type { LearningMode } from '@/lib/learning-mode';
import { isQuizPassed } from '../domain/activity';

interface Props {
  questions: QuizQuestion[];
  mode: LearningMode;
  /** Called once, when the last answer is given */
  onFinish: (correct: number, total: number) => void;
  /** Called with each answered question (to schedule its review) */
  onAnswered: (question: QuizQuestion, correct: boolean) => void;
}

/** One-shot quiz on a skill: pass it (4/5) to move up a level. */
export function SkillQuiz({ questions, mode, onFinish, onAnswered }: Props) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  function handleAnswer(optionId: QuizOptionId) {
    const q = questions[index];
    const ok = optionId === q.correctOptionId;
    const total = correct + (ok ? 1 : 0);
    if (ok) setCorrect(total);
    onAnswered(q, ok);
    setTimeout(() => {
      if (index >= questions.length - 1) { setDone(true); onFinish(total, questions.length); }
      else setIndex(index + 1);
    }, 1200);
  }

  if (done) {
    const passed = isQuizPassed(correct, questions.length);
    return (
      <p role="status" className={`rounded-2xl p-4 text-center font-bold ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
        {correct}/{questions.length} — {passed ? 'Bravo, tu montes d’un niveau ! 🎉' : 'Pas encore : relis les cartes puis réessaie.'}
      </p>
    );
  }
  return (
    <div>
      <p className="mb-3 text-xs font-bold text-slate-400">Question {index + 1} / {questions.length}</p>
      <QuizCard key={questions[index].id} question={questions[index]} mode={mode} onAnswer={handleAnswer} />
    </div>
  );
}
