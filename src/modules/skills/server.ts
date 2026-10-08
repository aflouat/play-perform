/** Server-only API of the skills module (used by API routes). */
export {
  isStudentOfParent, listEvaluationsForProfile, listPendingEvaluations, createEvaluation, correctEvaluation,
} from './infra/evaluation-repository';
export type { PendingEvaluation } from './infra/evaluation-repository';
export { validateSubmission } from './application/validate-submission';
export { validateCorrection } from './domain/evaluation';
export { getEvaluationPrompt } from './infra/evaluation-prompts';
export { listLevels, raiseLevel } from './infra/levels-repository';
export { validateLevelUpdate } from './application/validate-submission';
