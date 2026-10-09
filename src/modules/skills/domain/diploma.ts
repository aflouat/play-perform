import type { SkillEvaluation } from './evaluation';
import type { SkillLevelNumber } from './skill';

/** What still stands between the learner and the diploma, in the order to do it. */
export type DiplomaGap = 'enrollment' | 'level' | 'evaluation' | 'names';

export interface DiplomaInput {
  /** Level stored in the database (not the one claimed by the device) */
  level: SkillLevelNumber | null;
  enrolled: boolean;
  evaluations: readonly SkillEvaluation[];
  hasNames: boolean;
}

export interface DiplomaEligibility { eligible: boolean; missing: DiplomaGap[]; issuedOn: string | null }

/** The evaluation level from which a passed correction proves mastery. */
export const DIPLOMA_MIN_EVALUATION_LEVEL = 4;

/**
 * The diploma certifies the complete training: enrolled, mastery level reached, and an examiner validated a written
 * evaluation of level 4 or above (quizzes alone are not proof). Dated by the latest validation.
 */
export function diplomaEligibility(input: DiplomaInput): DiplomaEligibility {
  const proofs = input.evaluations.filter((e) => e.status === 'passed' && e.level >= DIPLOMA_MIN_EVALUATION_LEVEL && e.correctedAt);
  const missing: DiplomaGap[] = [
    ...(input.enrolled ? [] : ['enrollment' as const]),
    ...(input.level === 5 ? [] : ['level' as const]),
    ...(proofs.length > 0 ? [] : ['evaluation' as const]),
    ...(input.hasNames ? [] : ['names' as const]),
  ];
  const latest = proofs.map((e) => e.correctedAt as string).sort().at(-1) ?? null;
  return { eligible: missing.length === 0, missing, issuedOn: missing.length === 0 && latest ? latest.slice(0, 10) : null };
}

const hash32 = (text: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
};

/** Short reference printed on the diploma, stable for a learner, a skill and a date. */
export function diplomaReference(profileId: string, skillId: string, issuedOn: string): string {
  return `PP-${hash32(`${profileId}|${skillId}|${issuedOn}`).toString(16).toUpperCase().padStart(8, '0')}`;
}
