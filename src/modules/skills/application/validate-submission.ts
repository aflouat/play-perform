import { validateSubmission as validate, type EvaluationSubmission, type Validation } from '../domain/evaluation';
import { getSkillById } from '../infra/skills-repository';

/** Submission validation with the skills catalogue (unknown skills are rejected). */
export function validateSubmission(input: unknown): Validation<EvaluationSubmission> {
  return validate(input, (id) => getSkillById(id) !== undefined);
}
