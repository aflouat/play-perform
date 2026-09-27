'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SyllableWord } from '@/components/reading/SyllableWord';
import { parseSyllables } from '@/lib/reading/syllable-notation';
import { speakSyllables, stopSpeaking } from '@/lib/reading/reading-audio';
import type { LearningMode } from '@/lib/learning-mode';
import type { ReadingWord, Syllable } from '@/types';

interface Props { word: ReadingWord; mode: LearningMode; onDone: () => void; }

/**
 * « Découvrir » : image + mot en syllabes colorées. Toucher une syllabe la prononce ;
 * « Écouter » lance la lecture karaoké. En mode assisté, elle démarre toute seule.
 * Montée via key={word.id}.
 */
export function DiscoverView({ word, mode, onDone }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const play = useCallback(() => {
    const { word: plain, syllables } = parseSyllables(word.text, word.say);
    speakSyllables(syllables.map((s) => s.spoken), plain.toLowerCase(), {
      onSyllable: setActiveIndex,
      onEnd: () => setActiveIndex(null),
    });
  }, [word.text, word.say]);

  useEffect(() => {
    if (mode !== 'assisted') return;
    const t = setTimeout(play, 500); // laisse les voix TTS se charger
    return () => { clearTimeout(t); stopSpeaking(); };
  }, [mode, play]);

  function handleTap(index: number, syllable: Syllable) {
    speakSyllables([], syllable.spoken, {
      onSyllable: () => setActiveIndex(index),
      onEnd: () => setActiveIndex(null),
    });
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className={`w-full rounded-3xl bg-white shadow-xl text-center ${mode === 'assisted' ? 'p-8 border-2 border-violet-100' : 'p-6'}`}>
        <div className="text-8xl mb-4" aria-hidden="true">{word.emoji}</div>
        <SyllableWord word={word} activeIndex={activeIndex} onSyllableTap={handleTap} />
        <p className="text-slate-400 text-xs mt-4">Touche une syllabe pour l&apos;entendre</p>
      </div>

      <div className="flex gap-3 w-full">
        <button onClick={play}
          className="flex-1 rounded-2xl bg-white shadow py-4 font-bold text-slate-600 hover:shadow-md transition-shadow">
          🔊 Écouter
        </button>
        <button onClick={() => { stopSpeaking(); onDone(); }}
          className="flex-1 rounded-2xl bg-violet-600 py-4 font-bold text-white shadow-lg hover:bg-violet-500 transition-colors">
          ✅ J&apos;ai lu !
        </button>
      </div>
    </div>
  );
}
