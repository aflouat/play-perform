/** Server-only API of the community module (used by API routes). */
export { recordAnswers, loadDistributions, isValidAnswer } from './infra/stats-repository';
export type { AnsweredQuestion } from './infra/stats-repository';
