'use client';

import React, { useState, useCallback } from 'react';
import { getTypingWords } from '@/lib/phrase-data';
import { playSound, speakEnthusiastic } from '@/lib/audio';
import { useScore } from '@/hooks/useScore';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { WordTypingView } from '@/components/keyboard/WordTypingView';
import type { LearningMode } from '@/lib/learning-mode';

interface Props { profileId: string; mode: LearningMode; onFinish: () => void; }

export function WordMode({ profileId, mode, onFinish }: Props) {
  const [words] = useState(() => getTypingWords(1, 5));
  const [wordIdx, setWordIdx] = useState(0);
  const [score, setScore] = useState(0);
  const { addXp } = useScore(profileId);
  const { lastGain, popKey, triggerGain } = useXpGain();

  const currentWord = words[wordIdx];

  const handleComplete = useCallback(() => {
    if (!currentWord) return;
    addXp(10, 'quiz-correct'); triggerGain(10); setScore(s => s + 1);
    speakEnthusiastic(currentWord.text.toLowerCase());
    setTimeout(() => {
      if (wordIdx < words.length - 1) setWordIdx(i => i + 1);
      else { playSound('complete'); onFinish(); }
    }, 1000);
  }, [currentWord, wordIdx, words.length, addXp, triggerGain, onFinish]);

  if (!currentWord) return null;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <XpGainToast gain={lastGain} />

      <div className="flex justify-between w-full items-center">
        <div className={`text-3xl font-black text-emerald-500 score-pop`} key={popKey}>{score}/{words.length}</div>
        <div className="flex gap-1">
          {words.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i < wordIdx ? 'bg-emerald-400' : i === wordIdx ? 'bg-emerald-200' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      <WordTypingView key={currentWord.id} word={currentWord} mode={mode} onComplete={handleComplete} />
    </div>
  );
}
