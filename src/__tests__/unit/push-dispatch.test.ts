/** @jest-environment node */
import { validateSubscriptionInput } from '@/lib/push/validate';
import { dispatchDueReminders } from '@/lib/push/dispatch';
import * as repository from '@/lib/push/repository';
import type { ScheduledReminder } from '@/modules/skills';

jest.mock('@/lib/push/repository');
const repo = jest.mocked(repository);

const reminder: ScheduledReminder = { skillId: 'logique', skillName: 'Logique', level: 2, time: '18:00', dailyMinutes: 20, goalDate: null };
const valid = {
  profileId: 'p1', timezone: 'Europe/Paris', reminders: [reminder],
  subscription: { endpoint: 'https://push.example/abc', keys: { p256dh: 'k1', auth: 'k2' } },
};

describe('validateSubscriptionInput', () => {
  it('accepts a complete subscription with its reminders', () => {
    const result = validateSubscriptionInput(valid);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toMatchObject({ profileId: 'p1', endpoint: 'https://push.example/abc', p256dh: 'k1', timezone: 'Europe/Paris' });
  });
  it.each([
    ['no profile', { ...valid, profileId: '' }],
    ['http endpoint', { ...valid, subscription: { ...valid.subscription, endpoint: 'http://push.example/abc' } }],
    ['missing keys', { ...valid, subscription: { endpoint: 'https://push.example/abc' } }],
    ['bad time', { ...valid, reminders: [{ ...reminder, time: '25:00' }] }],
    ['bad level', { ...valid, reminders: [{ ...reminder, level: 9 }] }],
    ['too many reminders', { ...valid, reminders: Array(31).fill(reminder) }],
    ['not an object', null],
  ])('rejects %s', (_label, input) => {
    expect(validateSubscriptionInput(input).ok).toBe(false);
  });
});

describe('dispatchDueReminders', () => {
  const sub = { id: 's1', profile_id: 'p1', endpoint: 'https://push.example/abc', p256dh: 'k1', auth: 'k2', timezone: 'Europe/Paris', reminders: [reminder], sent: {} };
  const now = new Date('2026-10-08T16:10:00Z'); // 18:10 Paris

  beforeEach(() => { jest.resetAllMocks(); repo.listSubscriptionsWithReminders.mockResolvedValue([sub]); });

  it('pushes a due reminder once and records the day', async () => {
    const send = jest.fn().mockResolvedValue('sent');
    const report = await dispatchDueReminders(now, send);
    expect(report).toEqual({ subscriptions: 1, sent: 1, removed: 0, failed: 0 });
    expect(send).toHaveBeenCalledWith(sub, expect.objectContaining({ tag: 'reminder-logique', url: '/competences' }));
    expect(repo.markSent).toHaveBeenCalledWith('s1', { logique: '2026-10-08' });
  });

  it('does not push again the same day', async () => {
    repo.listSubscriptionsWithReminders.mockResolvedValue([{ ...sub, sent: { logique: '2026-10-08' } }]);
    const send = jest.fn();
    expect((await dispatchDueReminders(now, send)).sent).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });

  it('forgets a subscription the browser revoked', async () => {
    const report = await dispatchDueReminders(now, jest.fn().mockResolvedValue('gone'));
    expect(report.removed).toBe(1);
    expect(repo.removeById).toHaveBeenCalledWith('s1');
  });

  it('keeps the subscription and retries later when sending fails', async () => {
    const report = await dispatchDueReminders(now, jest.fn().mockResolvedValue('failed'));
    expect(report).toMatchObject({ failed: 1, sent: 0, removed: 0 });
    expect(repo.markSent).not.toHaveBeenCalled();
  });

  it('ignores a reminder that is hours late', async () => {
    const send = jest.fn();
    await dispatchDueReminders(new Date('2026-10-08T21:30:00Z'), send); // 23:30 Paris
    expect(send).not.toHaveBeenCalled();
  });
});
