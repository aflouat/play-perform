/** Chat of a weekly pair: open during their common project (the ISO week), then archived; kept by Play Perform as an audit trail. */

export const MESSAGE_MAX = 1000;
export const MESSAGES_PER_MINUTE = 20;
export type ChatState = 'open' | 'archived';

/** What every participant reads above the chat (transparency: minors, audit trail). */
export const CHAT_NOTICE = 'Ce chat est réservé à ton binôme pendant le projet de la semaine. Il est archivé à la fin du projet et conservé par Play Perform, qui peut le relire si le règlement n’est pas respecté. Reste respectueux·se et ne partage jamais tes coordonnées.';

/** Monday 00:00 (UTC) of an ISO week "YYYY-Www" → next Monday. */
export function weekWindow(week: string): { opensAt: string; closesAt: string } {
  const year = Number(week.slice(0, 4));
  const n = Number(week.slice(6));
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const monday = new Date(jan4.getTime() - ((jan4.getUTCDay() || 7) - 1) * 86_400_000 + (n - 1) * 7 * 86_400_000);
  return { opensAt: monday.toISOString(), closesAt: new Date(monday.getTime() + 7 * 86_400_000).toISOString() };
}

export const chatState = (w: { closesAt: string }, now: Date): ChatState => (now.getTime() < new Date(w.closesAt).getTime() ? 'open' : 'archived');

/** The same pair whatever the order of its members. */
export const membersKey = (ids: readonly string[]): string => [...ids].sort().join(',');

export function validateMessage(input: unknown): { ok: true; value: string } | { ok: false; error: string } {
  const text = typeof input === 'string' ? input.trim() : '';
  if (!text) return { ok: false, error: 'Message vide.' };
  if (text.length > MESSAGE_MAX) return { ok: false, error: `Ton message dépasse ${MESSAGE_MAX} caractères.` };
  return { ok: true, value: text };
}
