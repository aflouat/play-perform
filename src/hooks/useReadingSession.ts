'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { buildReadingSession, type ReadingChallenge } from '@/lib/reading/reading-session';
import { parseSyllables } from '@/lib/reading/syllable-notation';
import { playSound, speakEnthusiastic } from '@/lib/audio';
import type { ReadingActivity, ReadingLevel, ReadingWord, XpGain } from '@/types';

export const ANSWER_DELAY_MS = 1500;
const XP_DISCOVER = 5;
const XP_READ_CHOOSE = 10;

type Feedback = 'idle' | 'correct' | 'wrong';

interface Params {
  addXp: (amount: number, reason: XpGain['reason']) => void;
  triggerGain: (amount: number) => void;
}

/**
 * Session de lecture syllabique. L'état par mot (karaoké, indice) vit dans les vues,
 * remontées via key={current.target.id}.
 */
export function useReadingSession({ addXp, triggerGain }: Params) {
  const [activity, setActivityState] = useState<ReadingActivity>('discover');
  const [level, setLevelState] = useState<ReadingLevel>(1);
  const [challenges, setChallenges] = useState<ReadingChallenge[]>(() => buildReadingSession(1));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const reset = useCallback((nextLevel: ReadingLevel) => {
    if (timer.current) clearTimeout(timer.current);
    setChallenges(buildReadingSession(nextLevel));
    setCurrentIdx(0); setScore(0); setFeedback('idle'); setSelectedId(null); setFinished(false);
  }, []);

  const advance = useCallback(() => {
    setFeedback('idle'); setSelectedId(null);
    if (currentIdx + 1 >= challenges.length) { setFinished(true); playSound('complete'); }
    else setCurrentIdx(currentIdx + 1);
  }, [currentIdx, challenges.length]);

  const markRead = useCallback(() => {
    addXp(XP_DISCOVER, 'quiz-correct'); triggerGain(XP_DISCOVER);
    setScore((s) => s + 1);
    advance();
  }, [addXp, triggerGain, advance]);

  const select = useCallback((option: ReadingWord) => {
    if (feedback !== 'idle') return;
    const target = challenges[currentIdx].target;
    setSelectedId(option.id);
    if (option.id === target.id) {
      setFeedback('correct'); setScore((s) => s + 1);
      addXp(XP_READ_CHOOSE, 'quiz-correct'); triggerGain(XP_READ_CHOOSE);
      playSound('correct');
      speakEnthusiastic(parseSyllables(target.text).word.toLowerCase());
    } else {
      setFeedback('wrong'); playSound('wrong');
    }
    timer.current = setTimeout(advance, ANSWER_DELAY_MS);
  }, [feedback, challenges, currentIdx, addXp, triggerGain, advance]);

  return {
    activity, level, challenges, currentIdx, current: challenges[currentIdx],
    score, feedback, selectedId, finished, sessionLength: challenges.length,
    markRead, select,
    setActivity: (a: ReadingActivity) => { setActivityState(a); reset(level); },
    setLevel: (l: ReadingLevel) => { setLevelState(l); reset(l); },
    restart: () => reset(level),
  };
}
