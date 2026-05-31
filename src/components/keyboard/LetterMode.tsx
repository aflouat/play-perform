'use client';

import React from 'react';
import type { KeyboardLevel } from '@/lib/keyboard-data';
import { XpGainToast } from '@/components/ui/XpGainToast';
import { HintButton } from '@/components/ui/HintButton';
import type { LearningMode } from '@/lib/learning-mode';
import { useLetterGame } from '@/hooks/useLetterGame';

interface Props { profileId: string; mode: LearningMode; onFinish: () => void; }

export function LetterMode({ profileId, mode, onFinish }: Props) {
  const { level, setLevel, challenges, idx, feedback, score, hintUsed, showRow, current, lastGain, popKey, handleCorrect, handleHint, ROW_LABEL } =
    useLetterGame({ profileId, mode, onFinish });

  if (!current) return null;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <XpGainToast gain={lastGain} />

      <div className="flex justify-between w-full items-center">
        <div className={`text-3xl font-black text-emerald-500 score-pop`} key={popKey}>{score}/{challenges.length}</div>
        <div className="flex gap-1.5">
          {([1,2,3,4] as KeyboardLevel[]).map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${level===l?'bg-emerald-500 text-white shadow':'bg-white text-slate-400 shadow-sm'}`}>
              N{l}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className={`mb-1 ${mode === 'assisted' ? 'text-8xl' : 'text-7xl'}`}>{current.emoji}</div>
        <div className="text-slate-400 text-sm font-medium">{current.word}</div>
        {mode === 'assisted' && showRow && (
          <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-amber-700 text-xs font-medium">
            💡 {ROW_LABEL[level]}
          </div>
        )}
      </div>

      <div className={`w-36 h-36 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-200 ${
        feedback==='correct' ? 'bg-emerald-400 scale-110' : feedback==='wrong' ? 'bg-rose-400 scale-95' : `${current.color}`
      }`}>
        <span className="text-white font-black" style={{fontSize:'5rem',lineHeight:1}}>
          {feedback==='correct'?'✓':feedback==='wrong'?'✕':current.letter}
        </span>
      </div>

      <p className="text-slate-500 text-sm font-medium text-center">
        {feedback==='correct'?'🎉 Super !':feedback==='wrong'?'😊 Essaie encore !':'Appuie sur cette lettre !'}
      </p>

      {mode === 'assisted' && (
        <HintButton onHint={handleHint} used={hintUsed} />
      )}

      <button onClick={handleCorrect} disabled={feedback!=='idle'}
        className={`w-full rounded-2xl font-black text-2xl shadow-lg transition-all duration-200 ${mode==='assisted'?'py-6':'py-5'} ${
          feedback==='idle'?`${current.color} text-white active:scale-95`:'bg-slate-100 text-slate-300'
        }`}>
        {current.letter}
      </button>

      <div className="w-full flex justify-center gap-1.5">
        {challenges.map((_,i) => (
          <div key={i} className={`flex-1 h-2 rounded-full ${i<idx?'bg-emerald-400':i===idx?'bg-emerald-200':'bg-slate-200'}`}/>
        ))}
      </div>
    </div>
  );
}
