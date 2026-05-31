'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { KeyboardChallenge, KeyboardLevel } from '@/lib/keyboard-data';
import { playSound, speakEnthusiastic, speakInstruction } from '@/lib/audio';
import { HintButton } from '@/components/ui/HintButton';
import { ROW_LABEL } from '@/hooks/useLetterGame';
import type { LearningMode } from '@/lib/learning-mode';

type Feedback = 'idle' | 'correct' | 'wrong';

interface Props {
  challenge: KeyboardChallenge;
  level: KeyboardLevel;
  mode: LearningMode;
  onScored: () => void;
  onNext: () => void;
}

/**
 * Vue d'une lettre. Montée via key={challenge.id} : feedback et indice repartent
 * neufs à chaque lettre, sans effet de reset.
 */
export function LetterCardView({ challenge, level, mode, onScored, onNext }: Props) {
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [hintUsed, setHintUsed] = useState(false);
  const [showRow, setShowRow] = useState(false);

  // Au montage : énonce la lettre en mode assisté.
  useEffect(() => {
    if (mode === 'assisted') speakInstruction(`Lettre ${challenge.letter}. ${challenge.word}`);
  }, [mode, challenge.letter, challenge.word]);

  const handleCorrect = useCallback(() => {
    setFeedback(f => {
      if (f !== 'idle') return f;
      onScored();
      playSound('correct');
      speakEnthusiastic(challenge.word);
      setTimeout(onNext, 900);
      return 'correct';
    });
  }, [challenge.word, onScored, onNext]);

  const handleWrong = useCallback(() => {
    setFeedback(f => {
      if (f !== 'idle') return f;
      playSound('wrong');
      setTimeout(() => setFeedback('idle'), 650);
      return 'wrong';
    });
  }, []);

  function handleHint() {
    if (hintUsed) return;
    setHintUsed(true);
    setShowRow(true);
    speakInstruction(`Cherche la lettre ${challenge.letter} comme ${challenge.word}. Elle est sur la ${ROW_LABEL[level]}.`);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === challenge.key) handleCorrect();
      else if (/^[a-z]$/.test(e.key.toLowerCase())) handleWrong();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [challenge.key, handleCorrect, handleWrong]);

  return (
    <>
      <div className="text-center">
        <div className={`mb-1 ${mode === 'assisted' ? 'text-8xl' : 'text-7xl'}`}>{challenge.emoji}</div>
        <div className="text-slate-400 text-sm font-medium">{challenge.word}</div>
        {mode === 'assisted' && showRow && (
          <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-amber-700 text-xs font-medium">
            💡 {ROW_LABEL[level]}
          </div>
        )}
      </div>

      <div className={`w-36 h-36 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-200 ${
        feedback === 'correct' ? 'bg-emerald-400 scale-110' : feedback === 'wrong' ? 'bg-rose-400 scale-95' : `${challenge.color}`
      }`}>
        <span className="text-white font-black" style={{ fontSize: '5rem', lineHeight: 1 }}>
          {feedback === 'correct' ? '✓' : feedback === 'wrong' ? '✕' : challenge.letter}
        </span>
      </div>

      <p className="text-slate-500 text-sm font-medium text-center">
        {feedback === 'correct' ? '🎉 Super !' : feedback === 'wrong' ? '😊 Essaie encore !' : 'Appuie sur cette lettre !'}
      </p>

      {mode === 'assisted' && <HintButton onHint={handleHint} used={hintUsed} />}

      <button onClick={handleCorrect} disabled={feedback !== 'idle'}
        className={`w-full rounded-2xl font-black text-2xl shadow-lg transition-all duration-200 ${mode === 'assisted' ? 'py-6' : 'py-5'} ${
          feedback === 'idle' ? `${challenge.color} text-white active:scale-95` : 'bg-slate-100 text-slate-300'
        }`}>
        {challenge.letter}
      </button>
    </>
  );
}
