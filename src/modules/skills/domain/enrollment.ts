import type { Validation } from './evaluation';

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

/**
 * A learner's enrollment in a complete training (levels, corrected evaluations, study plan, diploma).
 * It is validated automatically at once; the centre can withdraw it afterwards. Quizzes and flashcards need no enrollment.
 */
export interface SkillEnrollment {
  id: string;
  profileId: string;
  /** Training centre the learner belongs to (the one that decides) */
  organizationId: string;
  skillId: string;
  motivation: string;
  status: EnrollmentStatus;
  centerComment: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface EnrollmentRequest { profileId: string; skillId: string; motivation: string }
export interface EnrollmentDecision { status: 'approved' | 'rejected'; comment: string }

export const MOTIVATION_MAX = 1000;
export const AUTO_VALIDATION_COMMENT = 'Inscription validée automatiquement';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export function validateEnrollmentRequest(input: unknown, knownSkill: (id: string) => boolean = () => true): Validation<EnrollmentRequest> {
  if (!isRecord(input)) return { ok: false, error: 'Requête invalide.' };
  const { profileId, skillId, motivation } = input;
  if (typeof profileId !== 'string' || !profileId) return { ok: false, error: 'Profil manquant.' };
  if (typeof skillId !== 'string' || !knownSkill(skillId)) return { ok: false, error: 'Compétence inconnue.' };
  const text = typeof motivation === 'string' ? motivation.trim() : '';
  if (text.length > MOTIVATION_MAX) return { ok: false, error: `Motivations trop longues (${MOTIVATION_MAX} caractères maximum).` };
  return { ok: true, value: { profileId, skillId, motivation: text } };
}

export function validateEnrollmentDecision(input: unknown): Validation<EnrollmentDecision> {
  if (!isRecord(input)) return { ok: false, error: 'Requête invalide.' };
  const { status, comment } = input;
  if (status !== 'approved' && status !== 'rejected') return { ok: false, error: 'Décision invalide (approved ou rejected).' };
  const text = typeof comment === 'string' ? comment.trim().slice(0, 1000) : '';
  if (status === 'rejected' && !text) return { ok: false, error: 'Indique la raison du refus.' };
  return { ok: true, value: { status, comment: text } };
}

/** The complete training is open once the enrollment is approved (automatically at once; a centre can withdraw it). */
export function isEnrolled(skillId: string, enrollments: readonly SkillEnrollment[]): boolean {
  return enrollments.some((e) => e.skillId === skillId && e.status === 'approved');
}
