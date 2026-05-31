'use client';

import React from 'react';
import type { KeyboardLevel } from '@/lib/keyboard-data';
import { XpGainToast } from '@/components/ui/XpGainToast';
import { LetterCardView } from '@/components/keyboard/LetterCardView';
import { useLetterGame } from '@/hooks/useLetterGame';
import type { LearningMode } from '@/lib/learning-mode';

interface Props { profileId: string; mode: LearningMode; onFinish: () => void; }

export function LetterMode({ profileId, mode, onFinish }: Props) {
  const { level, changeLevel, challenges, idx, score, current, lastGain, popKey, onScored, onNext } =
    useLetterGame({ profileId, mode, onFinish });

  if (!current) return null;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <XpGainToast gain={lastGain} />

      <div className="flex justify-between w-full items-center">
        <div className={`text-3xl font-black text-emerald-500 score-pop`} key={popKey}>{score}/{challenges.length}</div>
        <div className="flex gap-1.5">
          {([1, 2, 3, 4] as KeyboardLevel[]).map(l => (
            <button key={l} onClick={() => changeLevel(l)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${level === l ? 'bg-emerald-500 text-white shadow' : 'bg-white text-slate-400 shadow-sm'}`}>
              N{l}
            </button>
          ))}
        </div>
      </div>

      <LetterCardView key={current.id} challenge={current} level={level} mode={mode}
        onScored={onScored} onNext={onNext} />

      <div className="w-full flex justify-center gap-1.5">
        {challenges.map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full ${i < idx ? 'bg-emerald-400' : i === idx ? 'bg-emerald-200' : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
}
