import type { ScheduledReminder } from '@/modules/skills';
import type { SubscriptionInput } from './repository';

type Result = { ok: true; value: SubscriptionInput } | { ok: false; error: string };

const isString = (v: unknown, max = 600): v is string => typeof v === 'string' && v.length > 0 && v.length <= max;
const isTime = (v: unknown): v is string => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

function parseReminder(raw: unknown): ScheduledReminder | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (!isString(r.skillId, 80) || !isString(r.skillName, 120) || !isTime(r.time)) return null;
  const level = r.level === null ? null : r.level;
  if (level !== null && !(typeof level === 'number' && Number.isInteger(level) && level >= 1 && level <= 5)) return null;
  const minutes = r.dailyMinutes;
  if (minutes !== null && !(typeof minutes === 'number' && minutes >= 1 && minutes <= 600)) return null;
  const goal = r.goalDate;
  if (goal !== null && !(typeof goal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(goal))) return null;
  return { skillId: r.skillId, skillName: r.skillName, time: r.time, level: level as ScheduledReminder['level'], dailyMinutes: minutes as number | null, goalDate: goal as string | null };
}

/** Checks the body of PUT /api/push/subscription (browser input is untrusted). */
export function validateSubscriptionInput(input: unknown): Result {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.' };
  const b = input as Record<string, unknown>;
  const sub = (b.subscription ?? {}) as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  if (!isString(b.profileId, 80)) return { ok: false, error: 'Profil manquant.' };
  if (typeof sub.endpoint !== 'string' || !sub.endpoint.startsWith('https://') || sub.endpoint.length > 1000) return { ok: false, error: 'Abonnement invalide.' };
  if (!isString(sub.keys?.p256dh) || !isString(sub.keys?.auth)) return { ok: false, error: 'Clés d’abonnement manquantes.' };
  if (!Array.isArray(b.reminders) || b.reminders.length > 30) return { ok: false, error: 'Rappels invalides.' };
  const reminders = b.reminders.map(parseReminder);
  if (reminders.some((r) => r === null)) return { ok: false, error: 'Rappel invalide.' };
  const timezone = typeof b.timezone === 'string' && b.timezone.length <= 64 ? b.timezone : 'Europe/Paris';
  return { ok: true, value: { profileId: b.profileId, endpoint: sub.endpoint, p256dh: sub.keys!.p256dh as string, auth: sub.keys!.auth as string, timezone, reminders: reminders as ScheduledReminder[] } };
}
