import { renderHook, act } from '@testing-library/react';
import { useLandingFlow } from '@/modules/landing/application/useLandingFlow';

function setup() {
  const onResult = jest.fn();
  const hook = renderHook(() => useLandingFlow({ onResult }));
  return { ...hook, onResult };
}

describe('useLandingFlow', () => {
  it('starts by asking for the access mode', () => {
    const { result } = setup();
    expect(result.current.step).toBe('mode');
    expect(result.current.mode).toBeNull();
  });

  it('stays on the mode step when the visitor wants an account', () => {
    const { result } = setup();
    act(() => result.current.chooseMode('account'));
    expect(result.current.mode).toBe('account');
    expect(result.current.step).toBe('mode');
  });

  it('goes to the skill choice in guest mode', () => {
    const { result } = setup();
    act(() => result.current.chooseMode('guest'));
    expect(result.current.step).toBe('skill');
  });

  it('starts a 5-question placement test for the chosen skill', () => {
    const { result } = setup();
    act(() => result.current.chooseMode('guest'));
    act(() => result.current.chooseSkill('logique'));
    expect(result.current.step).toBe('test');
    expect(result.current.skill?.id).toBe('logique');
    expect(result.current.questions).toHaveLength(5);
    expect(result.current.question?.level).toBe(1);
  });

  it('ignores an unknown skill', () => {
    const { result } = setup();
    act(() => result.current.chooseMode('guest'));
    act(() => result.current.chooseSkill('unknown'));
    expect(result.current.step).toBe('skill');
  });

  it('computes and reports the result after the last answer', () => {
    const { result, onResult } = setup();
    act(() => result.current.chooseMode('guest'));
    act(() => result.current.chooseSkill('logique'));
    for (let i = 0; i < 5; i++) {
      const q = result.current.question!;
      act(() => result.current.answer(i < 3 ? q.correctIndex : null));
    }
    expect(result.current.step).toBe('result');
    expect(result.current.result).toMatchObject({ startLevel: 4, correct: 3, skipped: 2 });
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith('logique', expect.objectContaining({ startLevel: 4 }), expect.any(Array));
    const chosen = onResult.mock.calls[0][2] as (number | null)[];
    expect(chosen).toHaveLength(5);
    expect(chosen.slice(3)).toEqual([null, null]);
  });

  it('lets the visitor test another skill', () => {
    const { result } = setup();
    act(() => result.current.chooseMode('guest'));
    act(() => result.current.chooseSkill('logique'));
    act(() => result.current.answer(0));
    act(() => result.current.chooseAnotherSkill());
    expect(result.current.step).toBe('skill');
    expect(result.current.questionIndex).toBe(0);
    expect(result.current.skill).toBeNull();
  });
});
