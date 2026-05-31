'use client';

import { useState, useCallback, useEffect } from 'react';
import type { QuizQuestion, QuizAnswer, QuizOptionId, XpGain } from '@/types';
import { QUIZ_TIMER_SECONDS } from '@/components/shared/QuizCard';
import { playSound, speakEnthusiastic } from '@/lib/audio';

interface UseQuizSessionParams {
  profileId: string;
  allForSubject: QuizQuestion[];
  srsSelect: (all: QuizQuestion[], count: number, bypass: boolean) => QuizQuestion[];
  addXp: (amount: number, reason: XpGain['reason']) => void;
  triggerGain: (amount: number) => void;
  recordAnswer: (questionId: string, isCorrect: boolean) => void;
}

export function useQuizSession({
  profileId,
  allForSubject,
  srsSelect,
  addXp,
  triggerGain,
  recordAnswer,
}: UseQuizSessionParams) {
  const [sessionKey, setSessionKey] = useState(0);
  const [bypassRecent, setBypassRecent] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [finished, setFinished] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);

  // Sélection SRS = mélange aléatoire (Math.random) : impossible en render
  // (règle purity), donc effectuée en side-effect après résolution du profil.
  useEffect(() => {
    if (profileId === '__none__' || allForSubject.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions(srsSelect(allForSubject, 5, bypassRecent));
    setCurrentIndex(0); setAnswers([]); setFinished(false);
    setQuestionsLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, profileId, bypassRecent]);

  const handleAnswer = useCallback((optionId: QuizOptionId, timeMs: number) => {
    const q = questions[currentIndex];
    if (!q) return;
    const isCorrect = optionId === q.correctOptionId;
    if (isCorrect) {
      const multiplier = Math.max(0.3, 1 - (0.7 * timeMs / 1000 / QUIZ_TIMER_SECONDS));
      const xpEarned = Math.round(q.xpReward * multiplier);
      playSound('correct'); addXp(xpEarned, 'quiz-correct'); triggerGain(xpEarned); speakEnthusiastic('');
    } else { playSound('wrong'); }
    recordAnswer(q.id, isCorrect);
    setAnswers((prev) => {
      const next = [...prev, { questionId: q.id, selectedOptionId: optionId, isCorrect, timeMs }];
      if (currentIndex >= questions.length - 1) {
        if (next.every((a) => a.isCorrect)) { addXp(20, 'quiz-perfect'); triggerGain(20); }
        playSound('complete');
        setTimeout(() => setFinished(true), 1000);
      } else {
        setTimeout(() => setCurrentIndex((i) => i + 1), 1200);
      }
      return next;
    });
  }, [currentIndex, questions, addXp, triggerGain, recordAnswer]);

  function replay() {
    setBypassRecent(false);
    setSessionKey((k) => k + 1);
  }

  function continueAnyway() {
    setBypassRecent(true);
    setSessionKey((k) => k + 1);
  }

  return { questions, currentIndex, answers, finished, questionsLoaded, handleAnswer, replay, continueAnyway };
}
