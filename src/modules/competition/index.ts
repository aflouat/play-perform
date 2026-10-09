/** Public API of the competition module: rankings by centre (pseudonyms), weekly challenge, automatic medals. */
export { isoWeek, previousWeek, isWeek } from './domain/week';
export type { NicknameResult } from './domain/nickname';
export { validateNickname, generateNickname } from './domain/nickname';
export type { RankMetric, BoardRow, RankedRow, WeeklyResult, RankedResult, Award } from './domain/ranking';
export { rankBy, rankWeekly, awardsFor, MEDALS, AWARD_MIN_CORRECT } from './domain/ranking';
export type { WeeklyChallenge, ChallengeAnswer } from './application/challenge';
export { challengeFor, scoreChallenge, CHALLENGE_LENGTH } from './application/challenge';
export type { CompetitionData, CompetitionView } from './application/view';
export { buildCompetitionView, pastAwardsOf } from './application/view';
export type { TeacherAward } from './infra/competition-client';
export { updateRankingSettings, fetchTeacherAwards, revokeAwardRequest } from './infra/competition-client';
export { CompetitionPanel } from './ui/CompetitionPanel';
