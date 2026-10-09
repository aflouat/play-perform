/** ISO 8601 week of a date, e.g. "2026-W41" (weeks start on Monday). */
export function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); // the Thursday of this week decides the year
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function previousWeek(week: string): string {
  const [year, number] = [Number(week.slice(0, 4)), Number(week.slice(6))];
  if (number > 1) return `${year}-W${String(number - 1).padStart(2, '0')}`;
  return isoWeek(new Date(year - 1, 11, 28)); // 28 December is always in the last ISO week
}

export const isWeek = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(value);
