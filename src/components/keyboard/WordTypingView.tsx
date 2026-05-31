'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { TypingWord } from '@/lib/phrase-data';
import { playSound, speakInstruction } from '@/lib/audio';
import { HintButton } from '@/components/ui/HintButton';
import type { LearningMode } from '@/lib/learning-mode';

type LetterState = 'pending' | 'correct' | 'wrong';

const LETTER_COLORS: Record<LetterState, string> = {
  pending: 'bg-white border-2 border-slate-200 text-slate-500',
  correct: 'bg-emerald-400 border-2 border-emerald-500 text-white scale-110',
  wrong: 'bg-rose-400 border-2 border-rose-500 text-white',
};

interface Props {
  word: TypingWord;
  mode: LearningMode;
  onComplete: () => void;
}

/**
 * Vue de frappe d'un mot. Montée via key={word.id} : l'état de frappe repart
 * neuf à chaque mot, sans effet de reset.
 */
export function WordTypingView({ word, mode, onComplete }: Props) {
  const [letterStates, setLetterStates] = useState<LetterState[]>(
    () => word.text.split('').map((): LetterState => 'pending'),
  );
  const [typedIdx, setTypedIdx] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const wrongFlash = useRef(false);

  // Au montage : énonce la consigne en mode assisté.
  useEffect(() => {
    if (mode === 'assisted') speakInstruction(`Tape le mot : ${word.text.toLowerCase()}. ${word.hint}`);
  }, [mode, word.text, word.hint]);

  function handleHint() {
    if (hintUsed) return;
    setHintUsed(true);
    const spell = word.text.split('').join(' - ');
    speakInstruction(`Le mot s'épelle : ${spell}. Commence par ${word.text[typedIdx]}.`);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const expected = word.text[typedIdx]?.toLowerCase();
      if (!expected) return;
      const pressed = e.key.toLowerCase();
      if (pressed === expected) {
        setLetterStates(prev => { const n = [...prev]; n[typedIdx] = 'correct'; return n; });
        playSound('correct');
        const ni = typedIdx + 1;
        setTypedIdx(ni);
        if (ni >= word.text.length) onComplete();
      } else if (/^[a-zA-ZÀ-ÿ]$/.test(e.key)) {
        if (wrongFlash.current) return;
        wrongFlash.current = true;
        setLetterStates(prev => { const n = [...prev]; n[typedIdx] = 'wrong'; return n; });
        playSound('wrong');
        setTimeout(() => {
          setLetterStates(prev => { const n = [...prev]; n[typedIdx] = 'pending'; return n; });
          wrongFlash.current = false;
        }, 500);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [word.text, typedIdx, onComplete]);

  return (
    <>
      <div className="text-center">
        <div className={mode === 'assisted' ? 'text-8xl mb-1' : 'text-7xl mb-1'}>{word.emoji}</div>
        <div className="text-slate-400 text-sm">{word.hint}</div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {word.text.split('').map((letter, i) => (
          <div key={i}
            className={`w-12 h-14 rounded-xl flex items-center justify-center font-black text-xl shadow transition-all duration-200 ${LETTER_COLORS[letterStates[i] ?? 'pending']}`}>
            {mode === 'assisted' && letterStates[i] === 'pending' && i === typedIdx ? (
              <span className="text-amber-500 text-2xl">_</span>
            ) : letter}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow p-4 text-center w-full">
        <p className="text-slate-500 text-sm font-medium">
          {typedIdx < word.text.length ? (
            <>Tape la lettre <span className={`font-black text-lg ${mode === 'assisted' ? 'text-violet-600' : 'text-emerald-500'}`}>{word.text[typedIdx]}</span></>
          ) : '✓ Mot complet !'}
        </p>
        {mode === 'assisted' && <p className="text-slate-300 text-xs mt-1">Utilise ton clavier physique</p>}
      </div>

      {mode === 'assisted' && <HintButton onHint={handleHint} used={hintUsed} />}
    </>
  );
}
