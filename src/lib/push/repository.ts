import { getServerClient } from '@/lib/db/client';
import type { ScheduledReminder } from '@/modules/skills';

export interface PushSubscriptionRow {
  id: string; profile_id: string; endpoint: string; p256dh: string; auth: string;
  timezone: string; reminders: ScheduledReminder[]; sent: Record<string, string>;
}

export interface SubscriptionInput {
  profileId: string; endpoint: string; p256dh: string; auth: string; timezone: string; reminders: ScheduledReminder[];
}

const table = () => getServerClient().from('push_subscriptions');

/** Server-side only (service role). A device keeps one row: re-subscribing updates it. */
export async function saveSubscription(input: SubscriptionInput): Promise<void> {
  const { error } = await table().upsert({
    profile_id: input.profileId, endpoint: input.endpoint, p256dh: input.p256dh, auth: input.auth,
    timezone: input.timezone, reminders: input.reminders, updated_at: new Date().toISOString(),
  }, { onConflict: 'endpoint' });
  if (error) throw new Error(error.message);
}

export async function deleteSubscription(endpoint: string, profileId: string): Promise<void> {
  const { error } = await table().delete().eq('endpoint', endpoint).eq('profile_id', profileId);
  if (error) throw new Error(error.message);
}

export async function listSubscriptionsWithReminders(): Promise<PushSubscriptionRow[]> {
  const { data, error } = await table().select('*').neq('reminders', '[]');
  if (error) throw new Error(error.message);
  return (data ?? []) as PushSubscriptionRow[];
}

export async function markSent(id: string, sent: Record<string, string>): Promise<void> {
  await table().update({ sent }).eq('id', id);
}

/** The browser revoked the subscription (HTTP 404 / 410): forget it. */
export async function removeById(id: string): Promise<void> {
  await table().delete().eq('id', id);
}
