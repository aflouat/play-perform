/**
 * Types fondamentaux SYNTH.EDU — barrel re-export
 * Aucun `any` n'est toléré.
 */

// ── Domaine général ─────────────────────────────────────────────────────────

export interface User {
  id: string; name: string;
  grade: '6e' | '5e-skip' | '4e' | '3e';
  target: 'medecine' | 'data-scientist' | 'undecided';
  createdAt: Date;
}

export type Zone = 'lab' | 'clubs' | 'hub';

export type Subject =
  | 'maths' | 'francais' | 'svt' | 'histoire' | 'physique'
  | 'it' | 'culture' | 'espace' | 'meteo' | 'chimie'
  | 'mecanique' | 'geo' | 'anglais' | 'espagnol' | 'informatique' | 'telecom';

export interface Content {
  id: string; title: string; description: string;
  zone: Zone; subject: Subject; maxDurationSeconds: number;
  difficulty: 1 | 2 | 3 | 4 | 5; tags: string[];
}

export interface EngagementPing { userId: string; contentId: string; timestamp: Date; elapsedSeconds: number; }
export interface Progress { userId: string; contentId: string; totalSeconds: number; bricksEarned: number; completed: boolean; lastPingAt: Date | null; }
export interface BrickBalance { userId: string; lab: number; clubs: number; hub: number; total: number; }
export interface BrevetTopic { id: string; subject: Subject; name: string; gradeLevel: '5e' | '3e'; masteryPercent: number; requiredForBrevet: boolean; }

// ── Avatar ──────────────────────────────────────────────────────────────────

export type AvatarId = 'astronaut' | 'scientist' | 'ninja' | 'explorer' | 'wizard' | 'robot';

export interface Avatar { id: AvatarId; name: string; emoji: string; color: string; unlockXp: number; description: string; }

// ── Score ────────────────────────────────────────────────────────────────────

export type BadgeId = 'first-quiz' | 'streak-3' | 'streak-7' | 'perfect-quiz' | 'fast-learner' | 'knowledge-seeker';

export interface Badge { id: BadgeId; name: string; emoji: string; description: string; unlockedAt: Date | null; }
export interface Score { userId: string; xp: number; level: number; badges: Badge[]; streak: number; lastActivityAt: Date | null; }
export interface XpGain { amount: number; reason: 'quiz-correct' | 'quiz-perfect' | 'time-spent' | 'daily-login' | 'badge-earned'; timestamp: Date; }

// ── Quiz ─────────────────────────────────────────────────────────────────────

export type QuizOptionId = 'A' | 'B' | 'C' | 'D';
export type QuizDifficulty = 1 | 2 | 3 | 4;

export const DIFFICULTY_META: Record<QuizDifficulty, { label: string; color: string; icon: string; xpBase: number }> = {
  1: { label: 'Initié',   color: 'bg-emerald-400', icon: '🌱', xpBase: 10 },
  2: { label: 'Apprenti', color: 'bg-sky-400',     icon: '📖', xpBase: 15 },
  3: { label: 'Expert',   color: 'bg-violet-500',  icon: '⚡', xpBase: 20 },
  4: { label: 'Gourou',   color: 'bg-rose-600',    icon: '🔥', xpBase: 30 },
};

export interface QuizOption { id: QuizOptionId; text: string; textAssisted?: string; }

export interface QuizQuestion {
  id: string; subject: Subject; category?: string;
  question: string; questionAssisted?: string;
  emoji?: string; imageUrl?: string;
  options: [QuizOption, QuizOption, QuizOption, QuizOption];
  correctOptionId: QuizOptionId;
  explanation: string; explanationAssisted?: string;
  difficulty: QuizDifficulty; xpReward: number;
}

// ── Spaced Repetition ─────────────────────────────────────────────────────────

export type QuestionState = 'new' | 'learning' | 'review' | 'mastered';

export interface QuestionProgress {
  questionId: string; profileId: string; state: QuestionState;
  easeFactor: number; interval: number; repetitions: number;
  correctCount: number; wrongCount: number;
  lastSeen: string | null; nextReview: string | null;
}

export interface QuizAnswer { questionId: string; selectedOptionId: QuizOptionId; isCorrect: boolean; timeMs: number; }

export interface QuizSession {
  id: string; userId: string; subject: Subject;
  questions: QuizQuestion[]; answers: QuizAnswer[];
  startedAt: Date; completedAt: Date | null; totalXpEarned: number;
}
