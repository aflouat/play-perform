/** "Last time the learner looked at" corrections / answers to enrollment requests, to tell what is new. */
export type SeenKind = 'evaluations' | 'enrollments';

const key = (profileId: string, kind: SeenKind) => `pp:seen-${kind}:${profileId}`;

export function getSeen(profileId: string, kind: SeenKind): string | null {
  try { return localStorage.getItem(key(profileId, kind)); } catch { return null; }
}

export function markSeen(profileId: string, kind: SeenKind, now: Date = new Date()): void {
  try { localStorage.setItem(key(profileId, kind), now.toISOString()); } catch { /* storage unavailable */ }
}
