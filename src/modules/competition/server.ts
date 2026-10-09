/** Server-only API of the competition module (used by API routes). */
export { organizationOf, loadCompetitionData, saveChallengeResult, updateRankingProfile, revokeAward, ensureNickname } from './infra/competition-repository';
