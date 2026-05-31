import { renderHook, act } from '@testing-library/react';
import { useAvatar } from '@/hooks/useAvatar';

describe('useAvatar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with null avatar', () => {
    const { result } = renderHook(() => useAvatar('user-1'));
    expect(result.current.avatarId).toBeNull();
    expect(result.current.avatar).toBeNull();
  });

  it('selects an available avatar', () => {
    const { result } = renderHook(() => useAvatar('user-1', 0));
    act(() => {
      result.current.selectAvatar('astronaut');
    });
    expect(result.current.avatarId).toBe('astronaut');
    expect(result.current.avatar?.name).toBe('Astronaute');
  });

  it('refuses to select a locked avatar (insufficient XP)', () => {
    const { result } = renderHook(() => useAvatar('user-1', 0));
    act(() => {
      result.current.selectAvatar('explorer'); // requires 100 XP
    });
    expect(result.current.avatarId).toBeNull();
  });

  it('selects a locked avatar when XP is sufficient', () => {
    const { result } = renderHook(() => useAvatar('user-1', 150));
    act(() => {
      result.current.selectAvatar('explorer');
    });
    expect(result.current.avatarId).toBe('explorer');
  });

  it('persists avatar in localStorage', () => {
    const { result } = renderHook(() => useAvatar('user-1', 0));
    act(() => {
      result.current.selectAvatar('ninja');
    });
    const stored = localStorage.getItem('avatar:user-1');
    expect(stored).toBe('ninja');
  });

  it('restores avatar from localStorage on remount', () => {
    const { result, unmount } = renderHook(() => useAvatar('user-1', 0));
    act(() => {
      result.current.selectAvatar('scientist');
    });
    unmount();

    const { result: result2 } = renderHook(() => useAvatar('user-1', 0));
    expect(result2.current.avatarId).toBe('scientist');
  });

  it('returns unlocked avatars filtered by XP', () => {
    const { result } = renderHook(() => useAvatar('user-1', 0));
    const unlocked = result.current.unlockedAvatars;
    expect(unlocked.every((a) => a.unlockXp <= 0)).toBe(true);
    expect(unlocked.some((a) => a.id === 'astronaut')).toBe(true);
    expect(unlocked.some((a) => a.id === 'explorer')).toBe(false);
  });

  it('returns all avatars from allAvatars', () => {
    const { result } = renderHook(() => useAvatar('user-1', 0));
    expect(result.current.allAvatars.length).toBeGreaterThan(0);
  });
});
