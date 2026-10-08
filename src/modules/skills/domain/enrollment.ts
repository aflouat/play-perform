import type { SkillLevelNumber } from './skill';
import type { Validation } from './evaluation';

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected';

/** A learner's request to join a course, answered by the training centre. */
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

export const MOTIVATION_MIN = 30;
export const MOTIVATION_MAX = 1000;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export function validateEnrollmentRequest(input: unknown, knownSkill: (id: string) => boolean = () => true): Validation<EnrollmentRequest> {
  if (!isRecord(input)) return { ok: false, error: 'Requête invalide.' };
  const { profileId, skillId, motivation } = input;
  if (typeof profileId !== 'string' || !profileId) return { ok: false, error: 'Profil manquant.' };
  if (typeof skillId !== 'string' || !knownSkill(skillId)) return { ok: false, error: 'Compétence inconnue.' };
  const text = typeof motivation === 'string' ? motivation.trim() : '';
  if (text.length < MOTIVATION_MIN) return { ok: false, error: `Explique tes motivations (au moins ${MOTIVATION_MIN} caractères).` };
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

/** Learners work on a skill once the centre approved their request. A level already reached counts (earlier placements). */
export function isEnrolled(skillId: string, level: SkillLevelNumber | null, enrollments: readonly SkillEnrollment[]): boolean {
  return level !== null || enrollments.some((e) => e.skillId === skillId && e.status === 'approved');
}
