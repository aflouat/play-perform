/** Server-only API of the competition module (used by API routes). */
export { organizationOf, loadCompetitionData, saveChallengeResult, updateRankingProfile, revokeAward, ensureNickname, readIdentity, writeIdentity } from './infra/competition-repository';
