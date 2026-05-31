'use client';

import React from 'react';
import type { WordLang, WordCard, WordChallenge as WordChallengeType } from '@/lib/word-data';
import type { LearningMode } from '@/lib/learning-mode';
import { HintButton } from '@/components/ui/HintButton';
import { speakInstruction } from '@/lib/audio';

interface Props {
  current: WordChallengeType;
  challenges: WordChallengeType[];
  currentIdx: number;
  mode: LearningMode;
  lang: WordLang;
  feedback: 'idle' | 'correct' | 'wrong';
  selectedId: string | null;
  hintUsed: boolean;
  dimmedId: string | null;
  optionStyle: (option: WordCard) => string;
  onSelect: (option: WordCard) => void;
  onHint: () => void;
}

function toLangCode(lang: WordLang): string {
  return lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-GB' : 'es-ES';
}

export function WordChallenge({ current, challenges, currentIdx, mode, lang, feedback, selectedId, hintUsed, dimmedId, optionStyle, onSelect, onHint }: Props) {
  return (
    <>
      <div className="flex gap-1.5 mb-5">
        {challenges.map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full ${i < currentIdx ? 'bg-pink-400' : i === currentIdx ? 'bg-pink-200' : 'bg-slate-200'}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-4 items-center">
        <div className={`w-full rounded-3xl bg-white shadow-xl text-center ${mode === 'assisted' ? 'p-10 border-2 border-violet-100' : 'p-8'}`}>
          <div className={mode === 'assisted' ? 'text-9xl mb-3' : 'text-8xl mb-3'}>{current.target.emoji}</div>
          <p className="text-slate-400 text-sm">Quel est ce mot ?</p>
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={() => speakInstruction(current.target.word, toLangCode(lang))}
            className="flex-1 rounded-2xl bg-white shadow px-4 py-2.5 flex items-center justify-center gap-2 text-slate-600 font-semibold hover:shadow-md transition-shadow text-sm">
            🔊 Écouter
          </button>
          {mode === 'assisted' && <HintButton onHint={onHint} used={hintUsed} />}
        </div>

        {mode === 'assisted' && hintUsed && (
          <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-amber-700 text-xs flex items-center gap-2">
            <span>💡</span><span>Une mauvaise réponse est barrée. Écoute le mot !</span>
          </div>
        )}

        <div className="w-full grid grid-cols-1 gap-3">
          {current.options.map(option => (
            <button key={option.id} onClick={() => onSelect(option)}
              disabled={feedback !== 'idle' || option.id === dimmedId}
              className={`w-full rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${optionStyle(option)} ${mode === 'assisted' ? 'p-5' : ''}`}>
              <span className="text-3xl">{option.emoji}</span>
              <span className={`text-[#1a1a2e] font-black ${mode === 'assisted' ? 'text-2xl' : 'text-xl'}`}>{option.word}</span>
              {feedback !== 'idle' && option.id === current.target.id && <span className="ml-auto text-emerald-500 font-black">✓</span>}
              {feedback !== 'idle' && option.id === selectedId && option.id !== current.target.id && <span className="ml-auto text-rose-500 font-black">✕</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
