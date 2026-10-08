import { dueScheduledReminders } from '@/modules/skills';
import { listSubscriptionsWithReminders, markSent, removeById } from './repository';
import { sendPush, type PushPayload, type PushResult } from './send';

/** A reminder more than this late is dropped (the scheduler was down): it would no longer be useful. */
const GRACE_MINUTES = 90;

export interface DispatchReport { subscriptions: number; sent: number; removed: number; failed: number }

/** Sends every reminder that is due now. Meant to be called every few minutes by a scheduler. */
export async function dispatchDueReminders(
  now: Date = new Date(), send: (target: { endpoint: string; p256dh: string; auth: string }, payload: PushPayload) => Promise<PushResult> = sendPush,
): Promise<DispatchReport> {
  const report: DispatchReport = { subscriptions: 0, sent: 0, removed: 0, failed: 0 };
  for (const sub of await listSubscriptionsWithReminders()) {
    report.subscriptions += 1;
    const due = dueScheduledReminders(sub.reminders, now, sub.timezone, sub.sent ?? {}, GRACE_MINUTES);
    const sent = { ...(sub.sent ?? {}) };
    for (const reminder of due) {
      const result = await send(sub, { title: reminder.title, body: reminder.body, url: '/competences', tag: `reminder-${reminder.skillId}` });
      if (result === 'sent') { sent[reminder.skillId] = reminder.day; report.sent += 1; }
      else if (result === 'gone') { await removeById(sub.id); report.removed += 1; break; }
      else report.failed += 1;
    }
    if (due.length > 0 && Object.keys(sent).length > 0) await markSent(sub.id, sent);
  }
  return report;
}
