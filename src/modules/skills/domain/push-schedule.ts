import type { SkillLevelNumber } from './skill';
import { isReminderDue, reminderMessage, toDay } from './effort';

/** A reminder as stored with a push subscription: enough to build the message without the browser. */
export interface ScheduledReminder {
  skillId: string;
  skillName: string;
  level: SkillLevelNumber | null;
  /** HH:MM in the learner's timezone */
  time: string;
  dailyMinutes: number | null;
  goalDate: string | null;
}

export interface DueReminder { skillId: string; title: string; body: string; day: string }

/** A Date whose local fields equal the wall clock of `timeZone` at the instant `utc` (the server runs in UTC). */
export function zonedNow(utc: Date, timeZone: string): Date {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-GB', {
      timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).formatToParts(utc);
  } catch {
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), utc.getUTCHours(), utc.getUTCMinutes());
  }
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
}

/** Reminders to push right now, with their text. `sent` maps skill id → last day pushed. */
export function dueScheduledReminders(
  reminders: readonly ScheduledReminder[], nowUtc: Date, timeZone: string, sent: Record<string, string>, graceMinutes: number,
): DueReminder[] {
  const now = zonedNow(nowUtc, timeZone);
  return reminders.flatMap((r) => {
    const plan = { goalDate: r.goalDate, dailyMinutes: r.dailyMinutes, reminderTime: r.time };
    if (!isReminderDue(plan, now, sent[r.skillId] ?? null, graceMinutes)) return [];
    const { title, body } = reminderMessage(r.skillName, r.level, plan, now);
    return [{ skillId: r.skillId, title, body, day: toDay(now) }];
  });
}
