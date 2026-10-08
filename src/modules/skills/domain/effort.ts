import type { SkillLevelNumber } from './skill';
import { MINUTES_PER_LEVEL } from './course-sheet';

/** The learner's plan for one skill: when to be done, how long each day, and when to be reminded (HH:MM). */
export interface StudyPlan {
  goalDate: string | null;
  dailyMinutes: number | null;
  reminderTime: string | null;
}

export const EMPTY_PLAN: StudyPlan = { goalDate: null, dailyMinutes: null, reminderTime: null };

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Local date as YYYY-MM-DD. */
export function toDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Minutes of work left until mastery (level 5). */
export function remainingMinutes(level: SkillLevelNumber | null): number {
  return (5 - (level ?? 0)) * MINUTES_PER_LEVEL;
}

/** Daily minutes needed to reach mastery by the goal date (the goal day included). Null when not applicable. */
export function dailyMinutesNeeded(level: SkillLevelNumber | null, goalDate: string | null, now: Date): number | null {
  const remaining = remainingMinutes(level);
  if (remaining === 0 || !goalDate) return null;
  const [y, m, d] = goalDate.split('-').map(Number);
  const days = Math.round((new Date(y, m - 1, d).getTime() - startOfDay(now).getTime()) / DAY_MS);
  return days < 0 ? null : Math.ceil(remaining / Math.max(days, 1));
}

/** Day mastery is reached when working `dailyMinutes` every day starting today. */
export function victoryDate(level: SkillLevelNumber | null, dailyMinutes: number | null, now: Date): string | null {
  const remaining = remainingMinutes(level);
  if (remaining === 0) return toDay(now);
  if (!dailyMinutes || dailyMinutes <= 0) return null;
  const end = startOfDay(now);
  end.setDate(end.getDate() + Math.ceil(remaining / dailyMinutes));
  return toDay(end);
}

function minutesOfDay(time: string | null): number | null {
  const match = time?.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [h, m] = [Number(match[1]), Number(match[2])];
  return h < 24 && m < 60 ? h * 60 + m : null;
}

/** True once today's reminder time has passed and the reminder was not already sent today. */
export function isReminderDue(plan: StudyPlan, now: Date, lastNotifiedDay: string | null): boolean {
  const at = minutesOfDay(plan.reminderTime);
  if (at === null || lastNotifiedDay === toDay(now)) return false;
  return now.getHours() * 60 + now.getMinutes() >= at;
}

const formatDay = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

/** Notification text: the skill, today's effort and the objective. */
export function reminderMessage(skillName: string, level: SkillLevelNumber | null, plan: StudyPlan, now: Date): { title: string; body: string } {
  const minutes = plan.dailyMinutes ?? dailyMinutesNeeded(level, plan.goalDate, now);
  const effort = minutes ? `${minutes} min aujourd’hui` : 'Une petite session aujourd’hui';
  const victory = plan.goalDate ?? victoryDate(level, plan.dailyMinutes, now);
  const goal = victory ? ` Objectif : maîtriser la compétence d’ici le ${formatDay(victory)}.` : '';
  return { title: `⏰ C’est l’heure : ${skillName}`, body: `${effort} pour avancer.${goal}` };
}
