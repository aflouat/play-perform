import { computeStreak } from '@/lib/score-storage';

const day = (iso: string) => new Date(`${iso}T10:00:00`);

describe('computeStreak', () => {
  it('starts at 1 on the first activity', () => {
    expect(computeStreak(0, null, day('2026-10-08'))).toBe(1);
  });
  it('keeps the streak when playing again the same day', () => {
    expect(computeStreak(3, day('2026-10-08'), new Date('2026-10-08T22:00:00'))).toBe(3);
  });
  it('adds one when the last activity was yesterday', () => {
    expect(computeStreak(3, day('2026-10-07'), day('2026-10-08'))).toBe(4);
  });
  it('restarts at 1 after a missed day', () => {
    expect(computeStreak(5, day('2026-10-05'), day('2026-10-08'))).toBe(1);
  });
  it('never returns less than 1 when active today', () => {
    expect(computeStreak(0, day('2026-10-08'), day('2026-10-08'))).toBe(1);
  });
});
