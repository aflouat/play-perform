import { getSkillById } from '../infra/skills-repository';
import { isReminderDue, reminderMessage, toDay } from '../domain/effort';
import { getAllPlans } from './skill-plans';
import { getAllSkillLevels } from './skill-progress';

const sentKey = (profileId: string) => `pp:reminders-sent:${profileId}`;

export type ReminderPermission = 'unsupported' | NotificationPermission;

export function reminderPermission(): ReminderPermission {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
}

export async function requestReminderPermission(): Promise<ReminderPermission> {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.requestPermission();
}

function readSent(profileId: string): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(sentKey(profileId)) ?? '{}') as Record<string, string>; } catch { return {}; }
}

async function show(title: string, body: string, tag: string): Promise<void> {
  const options = { body, tag, icon: '/favicon.ico', data: { url: '/competences' } };
  const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (registration) await registration.showNotification(title, options);
  else new Notification(title, options);
}

/**
 * Sends today's reminders that are due (one per skill and per day) when the permission is granted.
 * Browser notifications fire while the app is open in a tab or window; a push service would be needed to wake a closed app.
 */
export async function sendDueReminders(profileId: string, now: Date): Promise<number> {
  if (reminderPermission() !== 'granted') return 0;
  const plans = getAllPlans(profileId);
  const levels = getAllSkillLevels(profileId);
  const sent = readSent(profileId);
  let count = 0;
  for (const [skillId, plan] of Object.entries(plans)) {
    const skill = getSkillById(skillId);
    if (!skill || !isReminderDue(plan, now, sent[skillId] ?? null)) continue;
    const { title, body } = reminderMessage(skill.name, levels[skillId] ?? null, plan, now);
    await show(title, body, `reminder-${skillId}`);
    sent[skillId] = toDay(now);
    count += 1;
  }
  if (count > 0) { try { localStorage.setItem(sentKey(profileId), JSON.stringify(sent)); } catch { /* storage unavailable */ } }
  return count;
}
