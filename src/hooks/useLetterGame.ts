'use client';

import { useState, useEffect, useCallback } from 'react';
import { getChallengesForLevel, type KeyboardLevel } from '@/lib/keyboard-data';
import { playSound, speakEnthusiastic, speakInstruction } from '@/lib/audio';
import type { LearningMode } from '@/lib/learning-mode';
import { useScore } from '@/hooks/useScore';
import { useXpGain } from '@/components/ui/XpGainToast';

type Feedback = 'idle' | 'correct' | 'wrong';

const ROW_LABEL: Record<KeyboardLevel, string> = {
  1: 'rangée du milieu (ASDFJKL)',
  2: 'rangée du haut (QWERTYUIOP)',
  3: 'rangée du bas (ZXCVBNM)',
  4: 'tout le clavier',
};

interface UseLetterGameParams { profileId: string; mode: LearningMode; onFinish: () => void; }

export function useLetterGame({ profileId, mode, onFinish }: UseLetterGameParams) {
  const [level, setLevel] = useState<KeyboardLevel>(1);
  const [challenges, setChallenges] = useState(() => getChallengesForLevel(1, 8));
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [score, setScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showRow, setShowRow] = useState(false);
  const { addXp } = useScore(profileId);
  const { lastGain, popKey, triggerGain } = useXpGain();

  const current = challenges[idx];

  useEffect(() => {
    const c = getChallengesForLevel(level, 8);
    setChallenges(c); setIdx(0); setFeedback('idle'); setScore(0);
  }, [level]);

  useEffect(() => {
    setHintUsed(false); setShowRow(false);
    if (!current) return;
    if (mode === 'assisted') speakInstruction(`Lettre ${current.letter}. ${current.word}`);
  }, [current?.id, mode]);

  const next = useCallback(() => {
    if (idx < challenges.length - 1) { setIdx((i) => i + 1); setFeedback('idle'); }
    else { playSound('complete'); onFinish(); }
  }, [idx, challenges.length, onFinish]);

  const handleCorrect = useCallback(() => {
    if (feedback !== 'idle') return;
    setFeedback('correct');
    setScore((s) => s + 1);
    addXp(5, 'quiz-correct');
    triggerGain(5);
    playSound('correct');
    speakEnthusiastic(current.word);
    setTimeout(next, 900);
  }, [feedback, current, addXp, triggerGain, next]);

  const handleWrong = useCallback(() => {
    if (feedback !== 'idle') return;
    setFeedback('wrong');
    playSound('wrong');
    setTimeout(() => setFeedback('idle'), 650);
  }, [feedback]);

  function handleHint() {
    if (hintUsed || !current) return;
    setHintUsed(true);
    setShowRow(true);
    speakInstruction(`Cherche la lettre ${current.letter} comme ${current.word}. Elle est sur la ${ROW_LABEL[level]}.`);
  }

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === current.key) handleCorrect();
      else if (/^[a-z]$/.test(e.key.toLowerCase())) handleWrong();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, handleCorrect, handleWrong]);

  return { level, setLevel, challenges, idx, feedback, score, hintUsed, showRow, current, lastGain, popKey, handleCorrect, handleHint, ROW_LABEL };
}
