import { validateSubmission as validate, type EvaluationSubmission, type Validation } from '../domain/evaluation';
import { validateLevelUpdate as validateLevel, type LevelUpdate } from '../domain/skill-levels';
import { getSkillById } from '../infra/skills-repository';

/** Submission validation with the skills catalogue (unknown skills are rejected). */
export function validateSubmission(input: unknown): Validation<EvaluationSubmission> {
  return validate(input, (id) => getSkillById(id) !== undefined);
}

export function validateLevelUpdate(input: unknown): Validation<LevelUpdate> {
  return validateLevel(input, (id) => getSkillById(id) !== undefined);
}
