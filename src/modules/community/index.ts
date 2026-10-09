/** Public API of the community module: constructive feedback, classic traps, weekly pairs, activity feed and cheers. */
export { MIN_SAMPLE, trapSummary, trapMessage, constructiveFeedback } from './domain/traps';
export type { TrapSummary } from './domain/traps';
export { fetchDistributions, sendAnswers } from './infra/community-client';
