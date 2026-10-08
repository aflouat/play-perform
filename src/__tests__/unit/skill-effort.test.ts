import { remainingMinutes, dailyMinutesNeeded, victoryDate, isReminderDue, reminderMessage, MINUTES_PER_LEVEL } from '@/modules/skills';

const NOW = new Date(2026, 9, 8, 18, 30); // 8 Oct 2026, 18:30 local

describe('remainingMinutes', () => {
  it('counts the levels left to reach mastery', () => {
    expect(remainingMinutes(null)).toBe(5 * MINUTES_PER_LEVEL);
    expect(remainingMinutes(3)).toBe(2 * MINUTES_PER_LEVEL);
    expect(remainingMinutes(5)).toBe(0);
  });
});

describe('dailyMinutesNeeded', () => {
  it('spreads the remaining work over the days left, rounded up', () => {
    expect(dailyMinutesNeeded(3, '2026-10-18', NOW)).toBe(24); // 240 min / 10 days
    expect(dailyMinutesNeeded(3, '2026-10-17', NOW)).toBe(27); // 240 / 9 = 26.7
  });
  it('is null without a goal date, once mastered, or when the date is past', () => {
    expect(dailyMinutesNeeded(3, null, NOW)).toBeNull();
    expect(dailyMinutesNeeded(5, '2026-10-18', NOW)).toBeNull();
    expect(dailyMinutesNeeded(3, '2026-10-01', NOW)).toBeNull();
  });
  it('asks for everything today when the goal is today', () => {
    expect(dailyMinutesNeeded(4, '2026-10-08', NOW)).toBe(MINUTES_PER_LEVEL);
  });
});

describe('victoryDate', () => {
  it('projects the day mastery is reached at a daily effort', () => {
    expect(victoryDate(3, 30, NOW)).toBe('2026-10-16'); // 240 / 30 = 8 days
    expect(victoryDate(3, 25, NOW)).toBe('2026-10-18'); // 9.6 → 10 days
  });
  it('is null without a positive daily effort, and today once mastered', () => {
    expect(victoryDate(3, null, NOW)).toBeNull();
    expect(victoryDate(3, 0, NOW)).toBeNull();
    expect(victoryDate(5, 30, NOW)).toBe('2026-10-08');
  });
});

describe('isReminderDue', () => {
  const plan = { goalDate: null, dailyMinutes: 20, reminderTime: '18:00' };
  it('fires once the time has passed and not twice a day', () => {
    expect(isReminderDue(plan, NOW, null)).toBe(true);
    expect(isReminderDue(plan, NOW, '2026-10-08')).toBe(false);
    expect(isReminderDue(plan, NOW, '2026-10-07')).toBe(true);
  });
  it('waits for the reminder time', () => {
    expect(isReminderDue({ ...plan, reminderTime: '19:00' }, NOW, null)).toBe(false);
  });
  it('does nothing without a reminder time or a valid one', () => {
    expect(isReminderDue({ ...plan, reminderTime: null }, NOW, null)).toBe(false);
    expect(isReminderDue({ ...plan, reminderTime: '25:99' }, NOW, null)).toBe(false);
  });
});

describe('reminderMessage', () => {
  it('reminds the time, the daily effort and the objective', () => {
    const msg = reminderMessage('Fractions', 2, { goalDate: '2026-10-30', dailyMinutes: 20, reminderTime: '18:00' }, NOW);
    expect(msg.title).toContain('Fractions');
    expect(msg.body).toContain('20 min');
    expect(msg.body).toContain('30');
  });
  it('falls back to the effort needed for the goal date', () => {
    const msg = reminderMessage('Fractions', 3, { goalDate: '2026-10-18', dailyMinutes: null, reminderTime: '18:00' }, NOW);
    expect(msg.body).toContain('24 min');
  });
});
