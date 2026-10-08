import type { SkillLevelNumber } from './skill';

export type EvaluationStatus = 'pending' | 'passed' | 'failed';

/** Open answer written by the learner, corrected by an examiner. */
export interface SkillEvaluation {
  id: string;
  profileId: string;
  skillId: string;
  level: SkillLevelNumber;
  prompt: string;
  answer: string;
  status: EvaluationStatus;
  examinerComment: string | null;
  createdAt: string;
  correctedAt: string | null;
}

export interface EvaluationSubmission {
  profileId: string;
  skillId: string;
  level: SkillLevelNumber;
  answer: string;
}

export interface EvaluationCorrection {
  status: 'passed' | 'failed';
  comment: string;
}

export type Validation<T> = { ok: true; value: T } | { ok: false; error: string };

export const ANSWER_MIN = 30;
export const ANSWER_MAX = 2000;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isLevel = (v: unknown): v is SkillLevelNumber => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5;

export function validateSubmission(input: unknown, knownSkill: (id: string) => boolean = () => true): Validation<EvaluationSubmission> {
  if (!isRecord(input)) return { ok: false, error: 'Requête invalide.' };
  const { profileId, skillId, level, answer } = input;
  if (typeof profileId !== 'string' || !profileId) return { ok: false, error: 'Profil manquant.' };
  if (typeof skillId !== 'string' || !knownSkill(skillId)) return { ok: false, error: 'Compétence inconnue.' };
  if (!isLevel(level)) return { ok: false, error: 'Niveau invalide.' };
  if (typeof answer !== 'string') return { ok: false, error: 'Réponse manquante.' };
  const text = answer.trim();
  if (text.length < ANSWER_MIN) return { ok: false, error: `Développe ta réponse (au moins ${ANSWER_MIN} caractères).` };
  if (text.length > ANSWER_MAX) return { ok: false, error: `Réponse trop longue (${ANSWER_MAX} caractères maximum).` };
  return { ok: true, value: { profileId, skillId, level, answer: text } };
}

export function validateCorrection(input: unknown): Validation<EvaluationCorrection> {
  if (!isRecord(input)) return { ok: false, error: 'Requête invalide.' };
  const { status, comment } = input;
  if (status !== 'passed' && status !== 'failed') return { ok: false, error: 'Décision invalide (passed ou failed).' };
  const text = typeof comment === 'string' ? comment.trim().slice(0, 1000) : '';
  if (status === 'failed' && !text) return { ok: false, error: 'Explique ce qui manque pour aider l’élève.' };
  return { ok: true, value: { status, comment: text } };
}

/** Level once the passed evaluations are applied: above every passed one, never lowered. */
export function levelAfterEvaluations(current: SkillLevelNumber | null, evaluations: readonly SkillEvaluation[]): SkillLevelNumber | null {
  const passed = evaluations.filter((e) => e.status === 'passed').map((e) => Math.min(5, e.level + 1));
  if (passed.length === 0) return current;
  return Math.max(current ?? 1, ...passed) as SkillLevelNumber;
}
