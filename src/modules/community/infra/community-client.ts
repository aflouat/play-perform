import { getAuthToken } from '@/lib/auth-token';

const headers = async () => ({ 'content-type': 'application/json', authorization: `Bearer ${await getAuthToken()}` });

/** Counts per option for each question (empty when unavailable: the feedback then simply has no statistics). */
export async function fetchDistributions(questionIds: string[]): Promise<Record<string, Record<string, number>>> {
  try {
    const res = await fetch(`/api/stats/answers?ids=${encodeURIComponent(questionIds.join(','))}`, { headers: await headers() });
    return res.ok ? ((await res.json()) as { distributions: Record<string, Record<string, number>> }).distributions : {};
  } catch { return {}; }
}

export async function sendAnswers(answers: { questionId: string; optionId: string }[]): Promise<void> {
  try { await fetch('/api/stats/answers', { method: 'POST', headers: await headers(), body: JSON.stringify({ answers }) }); } catch { /* statistics are best effort */ }
}
