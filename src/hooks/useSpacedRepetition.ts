'use client';

import { useState, useCallback } from 'react';
import type { QuizQuestion, QuestionProgress, Subject } from '@/types';
import {
  initProgress,
  updateProgress,
  selectQuestions,
  computeStats,
  loadProgressMap,
  saveProgressMap,
  type SubjectStats,
} from '@/lib/spaced-repetition';

interface UseSpacedRepetitionReturn {
  getQuestions: (all: QuizQuestion[], count: number) => QuizQuestion[];
  recordAnswer: (questionId: string, isCorrect: boolean) => void;
  stats: SubjectStats | null;
  computeSubjectStats: (all: QuizQuestion[]) => SubjectStats;
}

export function useSpacedRepetition(
  profileId: string,
  subject: Subject,
): UseSpacedRepetitionReturn {
  const [progressMap, setProgressMap] = useState<Record<string, QuestionProgress>>(
    () => loadProgressMap(profileId, subject),
  );

  const getQuestions = useCallback(
    (all: QuizQuestion[], count: number): QuizQuestion[] => {
      return selectQuestions(all, progressMap, count);
    },
    [progressMap],
  );

  const recordAnswer = useCallback(
    (questionId: string, isCorrect: boolean) => {
      setProgressMap((prev) => {
        const existing = prev[questionId] ?? initProgress(questionId, profileId);
        const updated = updateProgress(existing, isCorrect);
        const next = { ...prev, [questionId]: updated };
        saveProgressMap(profileId, subject, next);
        return next;
      });
    },
    [profileId, subject],
  );

  const computeSubjectStats = useCallback(
    (all: QuizQuestion[]): SubjectStats => computeStats(all, progressMap),
    [progressMap],
  );

  return { getQuestions, recordAnswer, stats: null, computeSubjectStats };
}
