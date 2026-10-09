'use client';

import { useEffect, useRef, useState } from 'react';
import type { QuizOptionId, QuizQuestion } from '@/types';
import { QuizCard } from '@/components/shared/QuizCard';
import type { LearningMode } from '@/lib/learning-mode';
import { fetchDistributions, sendAnswers, trapMessage, trapSummary } from '@/modules/community';
import { isQuizPassed } from '../domain/activity';

interface Props {
  questions: QuizQuestion[];
  mode: LearningMode;
  /** Called once, when the last answer is given */
  onFinish: (correct: number, total: number) => void;
  /** Called with each answered question (to schedule its review) */
  onAnswered: (question: QuizQuestion, correct: boolean) => void;
}

/** One-shot quiz on a skill: pass it (4/5) to move up a level. A mistake is a lesson, and others fall into the same traps. */
export function SkillQuiz({ questions, mode, onFinish, onAnswered }: Props) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [distributions, setDistributions] = useState<Record<string, Record<string, number>>>({});
  const given = useRef<{ questionId: string; optionId: string }[]>([]);

  // Anonymous statistics of the whole quiz, fetched once
  useEffect(() => { fetchDistributions(questions.map((q) => q.id)).then(setDistributions); }, [questions]);

  function handleAnswer(optionId: QuizOptionId) {
    const q = questions[index];
    const ok = optionId === q.correctOptionId;
    const total = correct + (ok ? 1 : 0);
    given.current.push({ questionId: q.id, optionId });
    if (ok) setCorrect(total);
    onAnswered(q, ok);
    setTimeout(() => {
      if (index >= questions.length - 1) { setDone(true); onFinish(total, questions.length); void sendAnswers(given.current); }
      else setIndex(index + 1);
    }, 1200);
  }

  if (done) {
    const passed = isQuizPassed(correct, questions.length);
    return (
      <p role="status" className={`rounded-2xl p-4 text-center font-bold ${passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
        {correct}/{questions.length} — {passed ? 'Bravo, tu montes d’un niveau ! 🎉' : 'Presque ! Chaque erreur t’a appris quelque chose : relis les explications, puis retente. 💪'}
      </p>
    );
  }
  const current = questions[index];
  return (
    <div>
      <p className="mb-3 text-xs font-bold text-slate-400">Question {index + 1} / {questions.length}</p>
      <QuizCard key={current.id} question={current} mode={mode} onAnswer={handleAnswer}
        trapNote={(chosen) => trapMessage(trapSummary(distributions[current.id] ?? {}, current.correctOptionId), chosen, current.correctOptionId)} />
    </div>
  );
}
