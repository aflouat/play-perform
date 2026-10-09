export interface FeedEventInfo { nickname: string; skillName: string; skillEmoji: string; level: number }

/** One line of the activity feed: pseudonym only. */
export function describeEvent(e: FeedEventInfo): string {
  return e.level >= 5
    ? `🚀 ${e.nickname} vient de maîtriser ${e.skillEmoji} ${e.skillName} (niveau 5) ! Bravo !`
    : `⭐ ${e.nickname} passe au niveau ${e.level} en ${e.skillEmoji} ${e.skillName} !`;
}

/** A "Bravo" is for a friend's success, given once. */
export function canCheer(event: { profileId: string }, viewerId: string, alreadyCheered: boolean): boolean {
  return event.profileId !== viewerId && !alreadyCheered;
}
