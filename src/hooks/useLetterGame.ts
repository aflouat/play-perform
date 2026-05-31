'use client';

import { useState, useCallback } from 'react';
import { getChallengesForLevel, type KeyboardLevel } from '@/lib/keyboard-data';
import { playSound } from '@/lib/audio';
import type { LearningMode } from '@/lib/learning-mode';
import { useScore } from '@/hooks/useScore';
import { useXpGain } from '@/components/ui/XpGainToast';

export const ROW_LABEL: Record<KeyboardLevel, string> = {
  1: 'rangée du milieu (ASDFJKL)',
  2: 'rangée du haut (QWERTYUIOP)',
  3: 'rangée du bas (ZXCVBNM)',
  4: 'tout le clavier',
};

interface UseLetterGameParams { profileId: string; mode: LearningMode; onFinish: () => void; }

/**
 * Logique conteneur du jeu de lettres (niveau, progression, score).
 * L'état par lettre (feedback, indice) vit dans <LetterCardView>, remonté via
 * key={current.id}. Le rechargement de niveau est fait dans un handler (pas un effet).
 */
export function useLetterGame({ profileId, onFinish }: UseLetterGameParams) {
  const [level, setLevel] = useState<KeyboardLevel>(1);
  const [challenges, setChallenges] = useState(() => getChallengesForLevel(1, 8));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const { addXp } = useScore(profileId);
  const { lastGain, popKey, triggerGain } = useXpGain();

  const current = challenges[idx];

  function changeLevel(l: KeyboardLevel) {
    setLevel(l);
    setChallenges(getChallengesForLevel(l, 8));
    setIdx(0);
    setScore(0);
  }

  const onScored = useCallback(() => {
    setScore(s => s + 1);
    addXp(5, 'quiz-correct');
    triggerGain(5);
  }, [addXp, triggerGain]);

  const onNext = useCallback(() => {
    if (idx < challenges.length - 1) setIdx(i => i + 1);
    else { playSound('complete'); onFinish(); }
  }, [idx, challenges.length, onFinish]);

  return { level, changeLevel, challenges, idx, score, current, lastGain, popKey, onScored, onNext };
}
