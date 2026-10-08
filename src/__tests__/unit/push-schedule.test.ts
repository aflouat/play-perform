import { zonedNow, dueScheduledReminders, isReminderDue, type ScheduledReminder } from '@/modules/skills';

describe('zonedNow', () => {
  it('turns a UTC instant into the wall clock of the learner timezone', () => {
    const paris = zonedNow(new Date('2026-10-08T16:30:00Z'), 'Europe/Paris'); // CEST = UTC+2
    expect([paris.getFullYear(), paris.getMonth(), paris.getDate(), paris.getHours(), paris.getMinutes()]).toEqual([2026, 9, 8, 18, 30]);
  });
  it('crosses midnight correctly', () => {
    const tokyo = zonedNow(new Date('2026-10-08T20:00:00Z'), 'Asia/Tokyo'); // UTC+9
    expect([tokyo.getDate(), tokyo.getHours()]).toEqual([9, 5]);
  });
  it('falls back to UTC for an unknown timezone', () => {
    expect(zonedNow(new Date('2026-10-08T16:30:00Z'), 'Nope/Nowhere').getHours()).toBe(16);
  });
});

describe('late reminders', () => {
  const plan = { goalDate: null, dailyMinutes: 20, reminderTime: '18:00' };
  it('are dropped once the grace period has passed', () => {
    const at = (h: number, m: number) => new Date(2026, 9, 8, h, m);
    expect(isReminderDue(plan, at(18, 20), null, 60)).toBe(true);
    expect(isReminderDue(plan, at(19, 30), null, 60)).toBe(false);
    expect(isReminderDue(plan, at(23, 0), null)).toBe(true); // in-app reminders have no limit
  });
});

describe('dueScheduledReminders', () => {
  const reminders: ScheduledReminder[] = [
    { skillId: 'logique', skillName: 'Logique', level: 2, time: '18:00', dailyMinutes: 20, goalDate: '2026-10-30' },
    { skillId: 'methode', skillName: 'Méthode', level: null, time: '07:00', dailyMinutes: null, goalDate: null },
  ];
  it('returns the messages to push now, once per skill and day', () => {
    const now = new Date('2026-10-08T16:10:00Z'); // 18:10 in Paris
    const due = dueScheduledReminders(reminders, now, 'Europe/Paris', {}, 60);
    expect(due.map((d) => d.skillId)).toEqual(['logique']);
    expect(due[0].title).toContain('Logique');
    expect(due[0].body).toContain('20 min');
    expect(due[0].day).toBe('2026-10-08');
  });
  it('skips what was already sent today', () => {
    const now = new Date('2026-10-08T16:10:00Z');
    expect(dueScheduledReminders(reminders, now, 'Europe/Paris', { logique: '2026-10-08' }, 60)).toEqual([]);
  });
});
