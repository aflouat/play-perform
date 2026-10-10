import { getServerClient } from '@/lib/db/client';

/** Server-side only (service role): chat threads of pairs and their messages (never edited nor deleted). */
export interface ChatThread { id: string; organizationId: string | null; contextKey: string; memberIds: string[]; opensAt: string; closesAt: string }
export interface ChatMessage { id: string; threadId: string; authorId: string; body: string; createdAt: string; reportedAt: string | null }

interface ThreadRow { id: string; organization_id: string | null; context_key: string; member_ids: string[]; opens_at: string; closes_at: string }
interface MessageRow { id: string; thread_id: string; author_profile_id: string; body: string; created_at: string; reported_at: string | null }
const toThread = (r: ThreadRow): ChatThread => ({ id: r.id, organizationId: r.organization_id, contextKey: r.context_key, memberIds: r.member_ids, opensAt: new Date(r.opens_at).toISOString(), closesAt: new Date(r.closes_at).toISOString() });
const toMessage = (r: MessageRow): ChatMessage => ({ id: r.id, threadId: r.thread_id, authorId: r.author_profile_id, body: r.body, createdAt: r.created_at, reportedAt: r.reported_at });
const threads = () => getServerClient().from('chat_threads');
const messages = () => getServerClient().from('chat_messages');

/** The thread of a pair for a project, created the first time one of them opens it. */
export async function findOrCreateThread(t: { organizationId: string; contextKey: string; membersKey: string; memberIds: string[]; opensAt: string; closesAt: string }): Promise<ChatThread> {
  const find = () => threads().select('*').eq('organization_id', t.organizationId).eq('context_kind', 'pair_week').eq('context_key', t.contextKey).eq('members_key', t.membersKey).maybeSingle();
  const { data: existing } = await find();
  if (existing) return toThread(existing as ThreadRow);
  const { error } = await threads().insert({
    organization_id: t.organizationId, context_kind: 'pair_week', context_key: t.contextKey, members_key: t.membersKey, member_ids: t.memberIds, opens_at: t.opensAt, closes_at: t.closesAt,
  });
  if (error && error.code !== '23505') throw new Error(error.message); // created meanwhile by the partner
  const { data, error: readError } = await find();
  if (readError || !data) throw new Error(readError?.message ?? 'Fil introuvable');
  return toThread(data as ThreadRow);
}

export async function getThread(id: string): Promise<ChatThread | null> {
  const { data, error } = await threads().select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toThread(data as ThreadRow) : null;
}

export async function listMessages(threadId: string, after: string | null = null): Promise<ChatMessage[]> {
  let query = messages().select('*').eq('thread_id', threadId).order('created_at').limit(500);
  if (after) query = query.gt('created_at', after);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as MessageRow[]).map(toMessage);
}

export async function insertMessage(threadId: string, authorId: string, body: string): Promise<ChatMessage> {
  const { data, error } = await messages().insert({ thread_id: threadId, author_profile_id: authorId, body }).select().single();
  if (error) throw new Error(error.message);
  return toMessage(data as MessageRow);
}

export async function getMessage(id: string): Promise<ChatMessage | null> {
  const { data } = await messages().select('*').eq('id', id).maybeSingle();
  return data ? toMessage(data as MessageRow) : null;
}

export async function reportMessage(id: string, reporterId: string): Promise<void> {
  const { error } = await messages().update({ reported_at: new Date().toISOString(), reported_by: reporterId }).eq('id', id).is('reported_at', null);
  if (error) throw new Error(error.message);
}

/** Audit (parent company): the threads, newest first, with their message and report counts. */
export async function listThreadsForAudit(reportedOnly: boolean): Promise<(ChatThread & { messageCount: number; reportCount: number })[]> {
  const { data, error } = await threads().select('*, chat_messages(id, reported_at)').order('opens_at', { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as (ThreadRow & { chat_messages: { id: string; reported_at: string | null }[] })[])
    .map((r) => ({ ...toThread(r), messageCount: r.chat_messages.length, reportCount: r.chat_messages.filter((m) => m.reported_at).length }))
    .filter((t) => !reportedOnly || t.reportCount > 0);
}

/** Pseudonyms and real names of learners (audit shows both). */
export async function learnerNames(ids: string[]): Promise<Map<string, { nickname: string | null; name: string }>> {
  if (ids.length === 0) return new Map();
  const { data } = await getServerClient().from('students').select('id, nickname, name, last_name').in('id', ids);
  return new Map(((data ?? []) as { id: string; nickname: string | null; name: string; last_name: string | null }[])
    .map((s) => [s.id, { nickname: s.nickname, name: [s.name, s.last_name].filter(Boolean).join(' ') }]));
}
