/** Server-only API of the competition module (used by API routes). */
export { organizationOf, loadCompetitionData, saveChallengeResult, updateRankingProfile, revokeAward, ensureNickname, readIdentity, writeIdentity, loadPairData, saveBonusClaim, recordMilestone, loadFeed, eventInfo, addCheer, hideEvent } from './infra/competition-repository';
