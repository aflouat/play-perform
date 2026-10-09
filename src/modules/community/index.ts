/** Public API of the community module: constructive feedback, classic traps, weekly pairs, activity feed and cheers. */
export { MIN_SAMPLE, trapSummary, trapMessage, constructiveFeedback, rankTraps } from './domain/traps';
export type { TrapSummary, TrapQuestion, ClassicTrap } from './domain/traps';
export { ClassicTraps } from './ui/ClassicTraps';
export { fetchDistributions, sendAnswers } from './infra/community-client';
