/** Server-only API of the competition module (used by API routes). */
export { organizationOf, loadCompetitionData, saveChallengeResult, updateRankingProfile, revokeAward, ensureNickname, readIdentity, writeIdentity, loadPairData, saveBonusClaim } from './infra/competition-repository';
export { recordMilestone, loadFeed, eventInfo, addCheer, hideEvent } from './infra/feed-repository';
export type { FeedRow } from './infra/feed-repository';
