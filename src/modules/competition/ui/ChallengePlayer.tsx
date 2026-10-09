'use client';

import { useRef, useState } from 'react';
import type { QuizOptionId } from '@/types';
import { QuizCard } from '@/components/shared/QuizCard';
import type { LearningMode } from '@/lib/learning-mode';
import type { ChallengeAnswer, WeeklyChallenge } from '../application/challenge';
import { submitChallenge } from '../infra/competition-client';

interface Props { profileId: string; challenge: WeeklyChallenge; mode: LearningMode; onDone: () => void }

/** Plays the week's challenge once; the server recomputes the score from the answers. */
export function ChallengePlayer({ profileId, challenge, mode, onDone }: Props) {
  const [index, setIndex] = useState(0);
  const [outcome, setOutcome] = useState<{ correct: number; total: number } | { error: string } | null>(null);
  const answers = useRef<ChallengeAnswer[]>([]);
  const duration = useRef(0);

  async function handleAnswer(optionId: QuizOptionId, timeMs: number) {
    const question = challenge.questions[index];
    answers.current.push({ questionId: question.id, optionId });
    duration.current += timeMs;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (index < challenge.questions.length - 1) { setIndex(index + 1); return; }
    const result = await submitChallenge(profileId, answers.current, duration.current);
    setOutcome(result);
    if (!('error' in result)) onDone();
  }

  if (outcome) {
    return 'error' in outcome
      ? <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">{outcome.error}</p>
      : <p role="status" className="rounded-2xl bg-emerald-50 p-4 text-center font-bold text-emerald-800">Défi terminé : {outcome.correct}/{outcome.total} 🎉</p>;
  }
  return (
    <div>
      <p className="mb-3 text-xs font-bold text-slate-400">Question {index + 1} / {challenge.questions.length}</p>
      <QuizCard key={challenge.questions[index].id} question={challenge.questions[index]} mode={mode} onAnswer={handleAnswer} />
    </div>
  );
}
