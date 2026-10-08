import { getAuthToken } from '@/lib/auth-token';
import { getSkillById } from '../infra/skills-repository';
import type { ScheduledReminder } from '../domain/push-schedule';
import { getAllPlans } from './skill-plans';
import { getAllSkillLevels } from './skill-progress';
import { requestReminderPermission } from './reminders';

export type EnableResult = 'ok' | 'denied' | 'unsupported' | 'not-configured' | 'failed';

const activeKey = (profileId: string) => `pp:push-active:${profileId}`;

/** True when this device receives reminders from the server (the in-app reminders then stay silent). */
export function isPushActive(profileId: string): boolean {
  try { return localStorage.getItem(activeKey(profileId)) === '1'; } catch { return false; }
}

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function toKey(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Reminders of a profile, as the server needs them to build the messages. */
export function collectReminders(profileId: string): ScheduledReminder[] {
  const levels = getAllSkillLevels(profileId);
  return Object.entries(getAllPlans(profileId)).flatMap(([skillId, plan]) => {
    const skill = getSkillById(skillId);
    if (!skill || !plan.reminderTime) return [];
    return [{ skillId, skillName: skill.name, level: levels[skillId] ?? null, time: plan.reminderTime, dailyMinutes: plan.dailyMinutes, goalDate: plan.goalDate }];
  });
}

async function send(method: 'PUT' | 'DELETE', body: unknown): Promise<boolean> {
  const res = await fetch('/api/push/subscription', {
    method, headers: { 'content-type': 'application/json', authorization: `Bearer ${await getAuthToken()}` }, body: JSON.stringify(body),
  });
  return res.ok;
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration();
  return registration ? registration.pushManager.getSubscription() : null;
}

/** Re-sends the reminders of this device to the server (call after a plan or a level changed). */
export async function syncPushReminders(profileId: string): Promise<void> {
  if (!pushSupported() || !isPushActive(profileId)) return;
  const subscription = await currentSubscription();
  if (!subscription) return;
  await send('PUT', { profileId, subscription: subscription.toJSON(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, reminders: collectReminders(profileId) });
}

/** Asks the permission, subscribes this device and registers it with the server. */
export async function enablePush(profileId: string): Promise<EnableResult> {
  if (!pushSupported()) return 'unsupported';
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return 'not-configured';
  if ((await requestReminderPermission()) !== 'granted') return 'denied';
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const subscription = (await registration.pushManager.getSubscription())
      ?? (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(publicKey) }));
    const ok = await send('PUT', { profileId, subscription: subscription.toJSON(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, reminders: collectReminders(profileId) });
    if (ok) localStorage.setItem(activeKey(profileId), '1');
    return ok ? 'ok' : 'failed';
  } catch { return 'failed'; }
}

export async function disablePush(profileId: string): Promise<void> {
  const subscription = pushSupported() ? await currentSubscription() : null;
  if (subscription) {
    await send('DELETE', { profileId, endpoint: subscription.endpoint }).catch(() => false);
    await subscription.unsubscribe().catch(() => false);
  }
  try { localStorage.removeItem(activeKey(profileId)); } catch { /* storage unavailable */ }
}
