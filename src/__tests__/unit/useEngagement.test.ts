import { renderHook, act } from '@testing-library/react';
import { useEngagement } from '@/hooks/useEngagement';

describe('useEngagement', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts active on mount', () => {
    const { result } = renderHook(() =>
      useEngagement({ userId: 'u1', contentId: 'c1', maxDurationSeconds: 300 }),
    );
    expect(result.current.isActive).toBe(true);
    expect(result.current.isAfk).toBe(false);
  });

  it('increments elapsedSeconds every second', () => {
    const { result } = renderHook(() =>
      useEngagement({ userId: 'u1', contentId: 'c1', maxDurationSeconds: 300 }),
    );
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.elapsedSeconds).toBe(5);
  });

  it('pauses when document.hidden is true', () => {
    const { result } = renderHook(() =>
      useEngagement({ userId: 'u1', contentId: 'c1', maxDurationSeconds: 300 }),
    );
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.elapsedSeconds).toBe(3);

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.elapsedSeconds).toBe(3);
    expect(result.current.isActive).toBe(false);
  });

  it('detects AFK after 60s of inactivity', () => {
    const { result } = renderHook(() =>
      useEngagement({ userId: 'u1', contentId: 'c1', maxDurationSeconds: 300 }),
    );
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current.isAfk).toBe(true);
  });

  it('freezes counter when AFK', () => {
    const { result } = renderHook(() =>
      useEngagement({ userId: 'u1', contentId: 'c1', maxDurationSeconds: 300 }),
    );
    // Trigger AFK
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current.isAfk).toBe(true);

    // Record elapsed right when AFK kicked in
    const elapsedWhenAfk = result.current.elapsedSeconds;

    // More time passes — counter must stay frozen
    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    expect(result.current.elapsedSeconds).toBe(elapsedWhenAfk);
  });

  it('resets AFK on user activity', () => {
    const { result } = renderHook(() =>
      useEngagement({ userId: 'u1', contentId: 'c1', maxDurationSeconds: 300 }),
    );
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(result.current.isAfk).toBe(true);

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove'));
    });
    expect(result.current.isAfk).toBe(false);
  });

  it('calls onPing every 30s while active', () => {
    const onPing = jest.fn();
    renderHook(() =>
      useEngagement({ userId: 'u1', contentId: 'c1', maxDurationSeconds: 300, onPing }),
    );
    // First ping at t=30s
    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    expect(onPing).toHaveBeenCalledTimes(1);

    // Reset AFK timer to avoid collision at t=60s
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove'));
    });

    // Second ping at t=60s (heartbeat fires, AFK was just reset so won't fire)
    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    expect(onPing).toHaveBeenCalledTimes(2);
  });

  it('does not ping when AFK', () => {
    const onPing = jest.fn();
    renderHook(() =>
      useEngagement({ userId: 'u1', contentId: 'c1', maxDurationSeconds: 300, onPing }),
    );
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    onPing.mockClear();

    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    expect(onPing).not.toHaveBeenCalled();
  });

  it('does not exceed maxDurationSeconds in ping', () => {
    const onPing = jest.fn();
    renderHook(() =>
      useEngagement({ userId: 'u1', contentId: 'c1', maxDurationSeconds: 10, onPing }),
    );
    act(() => {
      jest.advanceTimersByTime(30_000);
    });
    expect(onPing).not.toHaveBeenCalled();
  });
});
