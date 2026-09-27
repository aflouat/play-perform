import { renderHook, act } from '@testing-library/react';
import { useReadingSession, ANSWER_DELAY_MS } from '@/hooks/useReadingSession';

jest.mock('@/lib/audio', () => ({ playSound: jest.fn(), speakEnthusiastic: jest.fn() }));

function setup() {
  const addXp = jest.fn();
  const triggerGain = jest.fn();
  const hook = renderHook(() => useReadingSession({ addXp, triggerGain }));
  return { ...hook, addXp, triggerGain };
}

describe('useReadingSession', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('démarre en « Découvrir », niveau 1', () => {
    const { result } = setup();
    expect(result.current.activity).toBe('discover');
    expect(result.current.level).toBe(1);
    expect(result.current.currentIdx).toBe(0);
    expect(result.current.finished).toBe(false);
  });

  it('« Découvrir » : marquer un mot lu donne de l\'XP et passe au suivant', () => {
    const { result, addXp } = setup();
    act(() => result.current.markRead());
    expect(addXp).toHaveBeenCalledWith(5, 'quiz-correct');
    expect(result.current.currentIdx).toBe(1);
  });

  it('termine la session après le dernier mot', () => {
    const { result } = setup();
    for (let i = 0; i < result.current.sessionLength; i++) act(() => result.current.markRead());
    expect(result.current.finished).toBe(true);
  });

  it('« Lire et choisir » : la bonne image donne 10 XP puis passe au mot suivant', () => {
    const { result, addXp } = setup();
    act(() => result.current.setActivity('read-choose'));
    act(() => result.current.select(result.current.current.target));
    expect(result.current.feedback).toBe('correct');
    expect(result.current.score).toBe(1);
    expect(addXp).toHaveBeenCalledWith(10, 'quiz-correct');
    act(() => jest.advanceTimersByTime(ANSWER_DELAY_MS));
    expect(result.current.currentIdx).toBe(1);
    expect(result.current.feedback).toBe('idle');
  });

  it('« Lire et choisir » : une mauvaise image ne donne rien et bloque les autres clics', () => {
    const { result, addXp } = setup();
    act(() => result.current.setActivity('read-choose'));
    const { target, options } = result.current.current;
    const wrong = options.find((o) => o.id !== target.id)!;
    act(() => result.current.select(wrong));
    act(() => result.current.select(target));
    expect(result.current.feedback).toBe('wrong');
    expect(result.current.selectedId).toBe(wrong.id);
    expect(result.current.score).toBe(0);
    expect(addXp).not.toHaveBeenCalled();
  });

  it('changer de niveau recrée la session', () => {
    const { result } = setup();
    act(() => result.current.markRead());
    act(() => result.current.setLevel(4));
    expect(result.current.level).toBe(4);
    expect(result.current.currentIdx).toBe(0);
    expect(result.current.current.target.level).toBe(4);
  });
});
