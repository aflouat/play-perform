import { renderHook, act } from '@testing-library/react';
import { useScore } from '@/hooks/useScore';

describe('useScore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with zero XP and level 1', () => {
    const { result } = renderHook(() => useScore('test-user'));
    expect(result.current.score.xp).toBe(0);
    expect(result.current.score.level).toBe(1);
    expect(result.current.score.badges).toHaveLength(0);
    expect(result.current.score.streak).toBe(0);
  });

  it('gains XP when addXp is called', () => {
    const { result } = renderHook(() => useScore('test-user'));
    act(() => {
      result.current.addXp(50, 'quiz-correct');
    });
    expect(result.current.score.xp).toBe(50);
  });

  it('levels up at 100 XP threshold', () => {
    const { result } = renderHook(() => useScore('test-user'));
    act(() => {
      result.current.addXp(100, 'quiz-correct');
    });
    expect(result.current.score.level).toBe(2);
  });

  it('levels up multiple times correctly', () => {
    const { result } = renderHook(() => useScore('test-user'));
    act(() => {
      result.current.addXp(350, 'quiz-correct');
    });
    expect(result.current.score.level).toBe(4);
  });

  it('awards first-quiz badge on first XP gain', () => {
    const { result } = renderHook(() => useScore('test-user'));
    act(() => {
      result.current.addXp(10, 'quiz-correct');
    });
    const badge = result.current.score.badges.find((b) => b.id === 'first-quiz');
    expect(badge).toBeDefined();
    expect(badge?.unlockedAt).not.toBeNull();
  });

  it('awards perfect-quiz badge on quiz-perfect reason', () => {
    const { result } = renderHook(() => useScore('test-user'));
    act(() => {
      result.current.addXp(50, 'quiz-perfect');
    });
    const badge = result.current.score.badges.find((b) => b.id === 'perfect-quiz');
    expect(badge).toBeDefined();
  });

  it('persists score in localStorage', () => {
    const { result } = renderHook(() => useScore('test-user'));
    act(() => {
      result.current.addXp(75, 'quiz-correct');
    });
    const stored = localStorage.getItem('score:test-user');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.xp).toBe(75);
  });

  it('restores score from localStorage on remount', () => {
    const { result, unmount } = renderHook(() => useScore('test-user'));
    act(() => {
      result.current.addXp(80, 'quiz-correct');
    });
    unmount();

    const { result: result2 } = renderHook(() => useScore('test-user'));
    expect(result2.current.score.xp).toBe(80);
  });

  it('returns XP gains history', () => {
    const { result } = renderHook(() => useScore('test-user'));
    act(() => {
      result.current.addXp(10, 'quiz-correct');
      result.current.addXp(20, 'time-spent');
    });
    expect(result.current.gains).toHaveLength(2);
    expect(result.current.gains[0].amount).toBe(10);
    expect(result.current.gains[1].amount).toBe(20);
  });

  it('does not add negative XP', () => {
    const { result } = renderHook(() => useScore('test-user'));
    act(() => {
      result.current.addXp(-10, 'quiz-correct');
    });
    expect(result.current.score.xp).toBe(0);
  });

  it('returns xpToNextLevel correctly', () => {
    const { result } = renderHook(() => useScore('test-user'));
    expect(result.current.xpToNextLevel).toBe(100);
    act(() => {
      result.current.addXp(60, 'quiz-correct');
    });
    expect(result.current.xpToNextLevel).toBe(40);
  });
});
