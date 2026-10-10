import { getAuthToken } from '@/lib/auth-token';
import type { ChatState } from '../domain/chat';

export interface ChatView {
  thread: { id: string; closesAt: string; state: ChatState; members: { nickname: string; me: boolean }[] } | null;
  messages: ChatLine[];
}
export interface ChatLine { id: string; mine: boolean; author: string; body: string; createdAt: string; reported: boolean }

const headers = async () => ({ 'content-type': 'application/json', authorization: `Bearer ${await getAuthToken()}` });

/** The chat of my pair (null: not available, e.g. without a learner session). */
export async function fetchChat(after: string | null = null): Promise<ChatView | null> {
  try {
    const res = await fetch(`/api/chat${after ? `?after=${encodeURIComponent(after)}` : ''}`, { headers: await headers() });
    return res.ok ? ((await res.json()) as ChatView) : null;
  } catch { return null; }
}

export async function sendChatMessage(threadId: string, body: string): Promise<string | null> {
  try {
    const res = await fetch('/api/chat/messages', { method: 'POST', headers: await headers(), body: JSON.stringify({ threadId, body }) });
    return res.ok ? null : ((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Envoi impossible.';
  } catch { return 'Envoi impossible.'; }
}

export async function reportChatMessage(id: string): Promise<boolean> {
  try { return (await fetch(`/api/chat/messages/${id}/report`, { method: 'POST', headers: await headers() })).ok; } catch { return false; }
}
