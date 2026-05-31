import type { QuestionProgress, QuestionState, QuizQuestion } from '@/types';

const MIN_EASE = 1.3;
const MAX_EASE = 2.5;
const MASTERED_INTERVAL_DAYS = 21;

// ── SM-2 core ─────────────────────────────────────────────────────────────────

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
    // Courbe de mémorisation : J+3 minimum, puis J+7, puis croissance
    if (repetitions === 1) interval = 3;
    else if (repetitions === 2) interval = 7;
    else interval = Math.round(interval * easeFactor);
  } else {
    // Réponse fausse → question reposée à la prochaine session (interval 0)
    repetitions = 0;
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
    interval = 0; // due immédiatement à la prochaine session
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

// ── Selection — prioritize: due > new > mastered ──────────────────────────────

export function isDue(progress: QuestionProgress): boolean {
  // interval = 0 → toujours due (réponse fausse précédente)
  if (progress.interval === 0 && progress.lastSeen) return true;
  if (!progress.nextReview) return false;
  return new Date(progress.nextReview) <= new Date();
}

// Question vue il y a moins d'une heure → ne pas re-sélectionner immédiatement
const RECENT_THRESHOLD_MS = 60 * 60 * 1000; // 1 heure
export function isRecentlySeen(progress: QuestionProgress): boolean {
  if (!progress.lastSeen) return false;
  return Date.now() - new Date(progress.lastSeen).getTime() < RECENT_THRESHOLD_MS;
}

export function selectQuestions(
  allQuestions: QuizQuestion[],
  progressMap: Record<string, QuestionProgress>,
  count: number,
): QuizQuestion[] {
  const due: QuizQuestion[] = [];
  const newQ: QuizQuestion[] = [];
  const reviewing: QuizQuestion[] = []; // answered but not yet due
  const mastered: QuizQuestion[] = [];

  for (const q of allQuestions) {
    const p = progressMap[q.id];
    if (!p || p.state === 'new') {
      newQ.push(q);
    } else if (isDue(p) && p.state !== 'mastered') {
      due.push(q);
    } else if (p.state === 'mastered') {
      mastered.push(q);
    } else if (!isRecentlySeen(p)) {
      reviewing.push(q); // review state, not yet due, not seen in last hour
    }
    // Questions seen in the last hour are intentionally skipped
    // to respect the forgetting curve — they will be due at nextReview
  }

  // Sort due by nextReview ascending (most overdue first)
  due.sort((a, b) => {
    const pa = progressMap[a.id]?.nextReview ?? '';
    const pb = progressMap[b.id]?.nextReview ?? '';
    return pa.localeCompare(pb);
  });

  const selected: QuizQuestion[] = [...due];
  if (selected.length < count) {
    // Shuffle new questions for variety
    const shuffled = [...newQ].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, count - selected.length));
  }
  if (selected.length < count) {
    // Fill with reviewing (answered but not due yet) — allows Rejouer to work
    const shuffled = [...reviewing].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, count - selected.length));
  }
  if (selected.length < count) {
    // Fill with mastered (random, to keep them fresh)
    const shuffled = [...mastered].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, count - selected.length));
  }

  return selected.slice(0, count);
}

// ── Stats ─────────────────────────────────────────────────────────────────────

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

// ── localStorage persistence ──────────────────────────────────────────────────

const STORAGE_KEY = (profileId: string, subject: string) =>
  `srs:${profileId}:${subject}`;

export function loadProgressMap(
  profileId: string,
  subject: string,
): Record<string, QuestionProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY(profileId, subject));
    return raw ? (JSON.parse(raw) as Record<string, QuestionProgress>) : {};
  } catch { return {}; }
}

export function saveProgressMap(
  profileId: string,
  subject: string,
  map: Record<string, QuestionProgress>,
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY(profileId, subject), JSON.stringify(map));
}
