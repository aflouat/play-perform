import { groupOf, groupsOfWeek, isoWeek } from '@/modules/competition';
import { loadPairData } from '@/modules/competition/server';
import { membersKey, weekWindow } from '../domain/chat';
import { findOrCreateThread, type ChatThread } from '../infra/chat-repository';

/** Server-side only. The chat of the learner's pair for the current project (this week), with the pair's pseudonyms. */
export async function currentPairThread(profileId: string, now: Date): Promise<{ thread: ChatThread; nicknames: Map<string, string> } | null> {
  const week = isoWeek(now);
  const data = await loadPairData(profileId, week);
  if (!data) return null;
  const group = groupOf(groupsOfWeek(data.organizationId, week, data.students.map((s) => s.id)), profileId);
  if (!group) return null;
  const thread = await findOrCreateThread({ organizationId: data.organizationId, contextKey: week, membersKey: membersKey(group), memberIds: [...group].sort(), ...weekWindow(week) });
  return { thread, nicknames: new Map(data.students.map((s) => [s.id, s.nickname])) };
}
