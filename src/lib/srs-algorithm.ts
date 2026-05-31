import type { QuestionProgress, QuestionState, QuizQuestion } from '@/types';

const MIN_EASE = 1.3;
const MAX_EASE = 2.5;
const MASTERED_INTERVAL_DAYS = 21;

export function initProgress(questionId: string, profileId: string): QuestionProgress {
  return {
    questionId,
    profileId,
    state: 'new',
    easeFactor: 2.0,
    interval: 0,
    repetitions: 0,
    correctCount: 0,
    wrongCount: 0,
    lastSeen: null,
    nextReview: null,
  };
}

export function updateProgress(
  prev: QuestionProgress,
  isCorrect: boolean,
): QuestionProgress {
  const now = new Date();
  let { easeFactor, interval, repetitions } = prev;

  if (isCorrect) {
    repetitions += 1;
    easeFactor = Math.min(MAX_EASE, easeFactor + 0.1);
    if (repetitions === 1) interval = 3;
    else if (repetitions === 2) interval = 7;
    else interval = Math.round(interval * easeFactor);
  } else {
    repetitions = 0;
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
    interval = 0;
  }

  const state: QuestionState =
    interval >= MASTERED_INTERVAL_DAYS ? 'mastered' :
    repetitions === 0 ? 'learning' :
    'review';

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    ...prev,
    state,
    easeFactor,
    interval,
    repetitions,
    correctCount: prev.correctCount + (isCorrect ? 1 : 0),
    wrongCount: prev.wrongCount + (isCorrect ? 0 : 1),
    lastSeen: now.toISOString(),
    nextReview: nextReview.toISOString(),
  };
}

export function isDue(progress: QuestionProgress): boolean {
  if (progress.interval === 0 && progress.lastSeen) return true;
  if (!progress.nextReview) return false;
  return new Date(progress.nextReview) <= new Date();
}

const RECENT_THRESHOLD_MS = 60 * 60 * 1000;
export function isRecentlySeen(progress: QuestionProgress): boolean {
  if (!progress.lastSeen) return false;
  return Date.now() - new Date(progress.lastSeen).getTime() < RECENT_THRESHOLD_MS;
}

export function selectQuestions(
  allQuestions: QuizQuestion[],
  progressMap: Record<string, QuestionProgress>,
  count: number,
  bypassRecent = false,
): QuizQuestion[] {
  const due: QuizQuestion[] = [];
  const newQ: QuizQuestion[] = [];
  const reviewing: QuizQuestion[] = [];
  const mastered: QuizQuestion[] = [];

  for (const q of allQuestions) {
    const p = progressMap[q.id];
    if (!p || p.state === 'new') {
      newQ.push(q);
    } else if (isDue(p) && p.state !== 'mastered') {
      due.push(q);
    } else if (p.state === 'mastered') {
      mastered.push(q);
    } else if (bypassRecent || !isRecentlySeen(p)) {
      reviewing.push(q);
    }
  }

  due.sort((a, b) => {
    const pa = progressMap[a.id]?.nextReview ?? '';
    const pb = progressMap[b.id]?.nextReview ?? '';
    return pa.localeCompare(pb);
  });

  const selected: QuizQuestion[] = [...due];
  if (selected.length < count) {
    const shuffled = [...newQ].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, count - selected.length));
  }
  if (selected.length < count) {
    const shuffled = [...reviewing].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, count - selected.length));
  }
  if (selected.length < count) {
    const shuffled = [...mastered].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, count - selected.length));
  }

  return selected.slice(0, count);
}

export interface SubjectStats {
  total: number;
  newCount: number;
  dueCount: number;
  learningCount: number;
  masteredCount: number;
}

export function computeStats(
  allQuestions: QuizQuestion[],
  progressMap: Record<string, QuestionProgress>,
): SubjectStats {
  let newCount = 0, dueCount = 0, learningCount = 0, masteredCount = 0;
  for (const q of allQuestions) {
    const p = progressMap[q.id];
    if (!p || p.state === 'new') { newCount++; continue; }
    if (p.state === 'mastered') { masteredCount++; continue; }
    if (isDue(p)) { dueCount++; continue; }
    learningCount++;
  }
  return { total: allQuestions.length, newCount, dueCount, learningCount, masteredCount };
}
