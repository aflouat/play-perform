'use client';

import React, { useState, useEffect } from 'react';
import { SyllableWord } from '@/components/reading/SyllableWord';
import { HintButton } from '@/components/ui/HintButton';
import { parseSyllables } from '@/lib/reading/syllable-notation';
import { speakSyllables, stopSpeaking } from '@/lib/reading/reading-audio';
import type { ReadingChallenge } from '@/lib/reading/reading-session';
import type { LearningMode } from '@/lib/learning-mode';
import type { ReadingWord } from '@/types';

interface Props {
  challenge: ReadingChallenge;
  mode: LearningMode;
  feedback: 'idle' | 'correct' | 'wrong';
  selectedId: string | null;
  onSelect: (option: ReadingWord) => void;
}

/**
 * « Lire et choisir » : l'enfant lit le mot (sans le son) et choisit la bonne image.
 * Indice (mode assisté) : lecture karaoké + une mauvaise image grisée.
 * Après une erreur, le mot est lu pour corriger. Montée via key={target.id}.
 */
export function ReadChooseView({ challenge, mode, feedback, selectedId, onSelect }: Props) {
  const { target, options } = challenge;
  const [hintUsed, setHintUsed] = useState(false);
  const [dimmedId, setDimmedId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => () => stopSpeaking(), []);

  function readAloud() {
    const { word, syllables } = parseSyllables(target.text, target.say);
    speakSyllables(syllables.map((s) => s.spoken), word.toLowerCase(), {
      onSyllable: setActiveIndex,
      onEnd: () => setActiveIndex(null),
    });
  }

  function handleHint() {
    if (hintUsed || feedback !== 'idle') return;
    setHintUsed(true);
    setDimmedId(options.find((o) => o.id !== target.id)?.id ?? null);
    readAloud();
  }

  function handleSelect(option: ReadingWord) {
    onSelect(option);
    if (option.id !== target.id) readAloud();
  }

  function optionStyle(option: ReadingWord): string {
    if (feedback === 'idle') {
      return option.id === dimmedId
        ? 'bg-slate-50 opacity-30 cursor-not-allowed'
        : 'bg-white shadow-md hover:shadow-lg border-2 border-transparent hover:border-violet-200 active:scale-95';
    }
    if (option.id === target.id) return 'bg-emerald-50 border-2 border-emerald-400 shadow';
    if (option.id === selectedId) return 'bg-rose-50 border-2 border-rose-400 shadow';
    return 'bg-white opacity-40 border-2 border-transparent';
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className={`w-full rounded-3xl bg-white shadow-xl text-center ${mode === 'assisted' ? 'p-8 border-2 border-violet-100' : 'p-6'}`}>
        <p className="text-slate-400 text-sm mb-3">Lis le mot et trouve la bonne image</p>
        <SyllableWord word={target} activeIndex={activeIndex} />
      </div>

      {mode === 'assisted' && <HintButton onHint={handleHint} used={hintUsed} disabled={feedback !== 'idle'} />}

      <div className="grid grid-cols-3 gap-3 w-full">
        {options.map((option, i) => (
          <button key={option.id} onClick={() => handleSelect(option)}
            disabled={feedback !== 'idle' || option.id === dimmedId}
            aria-label={`Image ${i + 1}`}
            className={`rounded-2xl aspect-square flex items-center justify-center text-6xl transition-all duration-200 ${optionStyle(option)}`}>
            {option.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
