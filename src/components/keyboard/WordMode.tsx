'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getTypingWords } from '@/lib/phrase-data';
import { playSound, speakEnthusiastic, speakInstruction } from '@/lib/audio';
import { useScore } from '@/hooks/useScore';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { HintButton } from '@/components/ui/HintButton';
import type { LearningMode } from '@/lib/learning-mode';

interface Props { profileId: string; mode: LearningMode; onFinish: () => void; }

type LetterState = 'pending' | 'correct' | 'wrong';

export function WordMode({ profileId, mode, onFinish }: Props) {
  const [words] = useState(() => getTypingWords(1, 5));
  const [wordIdx, setWordIdx] = useState(0);
  const [letterStates, setLetterStates] = useState<LetterState[]>([]);
  const [typedIdx, setTypedIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const wrongFlash = useRef(false);
  const { addXp } = useScore(profileId);
  const { lastGain, popKey, triggerGain } = useXpGain();

  const currentWord = words[wordIdx];

  useEffect(() => {
    if (!currentWord) return;
    setLetterStates(currentWord.text.split('').map((): LetterState => 'pending'));
    setTypedIdx(0);
    setHintUsed(false);
    if (mode === 'assisted') {
      speakInstruction(`Tape le mot : ${currentWord.text.toLowerCase()}. ${currentWord.hint}`);
    }
  }, [wordIdx, currentWord?.id, mode]);

  const nextWord = useCallback(() => {
    if (wordIdx < words.length - 1) setWordIdx((i) => i + 1);
    else { playSound('complete'); onFinish(); }
  }, [wordIdx, words.length, onFinish]);

  function handleHint() {
    if (hintUsed || !currentWord) return;
    setHintUsed(true);
    const spell = currentWord.text.split('').join(' - ');
    speakInstruction(`Le mot s'épelle : ${spell}. Commence par ${currentWord.text[typedIdx]}.`);
  }

  useEffect(() => {
    if (!currentWord) return;
    const onKey = (e: KeyboardEvent) => {
      const expected = currentWord.text[typedIdx]?.toLowerCase();
      if (!expected) return;
      const pressed = e.key.toLowerCase();
      if (pressed === expected) {
        setLetterStates(prev => { const n=[...prev]; n[typedIdx]='correct'; return n; });
        playSound('correct');
        const ni = typedIdx + 1;
        setTypedIdx(ni);
        if (ni >= currentWord.text.length) {
          addXp(10, 'quiz-correct'); triggerGain(10); setScore(s=>s+1);
          speakEnthusiastic(currentWord.text.toLowerCase());
          setTimeout(nextWord, 1000);
        }
      } else if (/^[a-zA-ZÀ-ÿ]$/.test(e.key)) {
        if (wrongFlash.current) return;
        wrongFlash.current = true;
        setLetterStates(prev => { const n=[...prev]; n[typedIdx]='wrong'; return n; });
        playSound('wrong');
        setTimeout(() => {
          setLetterStates(prev => { const n=[...prev]; n[typedIdx]='pending'; return n; });
          wrongFlash.current = false;
        }, 500);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentWord, typedIdx, nextWord, addXp, triggerGain]);

  if (!currentWord) return null;

  const letterColors: Record<LetterState, string> = {
    pending: 'bg-white border-2 border-slate-200 text-slate-500',
    correct: 'bg-emerald-400 border-2 border-emerald-500 text-white scale-110',
    wrong: 'bg-rose-400 border-2 border-rose-500 text-white',
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <XpGainToast gain={lastGain} />

      <div className="flex justify-between w-full items-center">
        <div className={`text-3xl font-black text-emerald-500 score-pop`} key={popKey}>{score}/{words.length}</div>
        <div className="flex gap-1">
          {words.map((_,i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i<wordIdx?'bg-emerald-400':i===wordIdx?'bg-emerald-200':'bg-slate-200'}`}/>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className={mode==='assisted'?'text-8xl mb-1':'text-7xl mb-1'}>{currentWord.emoji}</div>
        <div className="text-slate-400 text-sm">{currentWord.hint}</div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {currentWord.text.split('').map((letter, i) => (
          <div key={i}
            className={`w-12 h-14 rounded-xl flex items-center justify-center font-black text-xl shadow transition-all duration-200 ${letterColors[letterStates[i] ?? 'pending']}`}>
            {mode === 'assisted' && letterStates[i] === 'pending' && i === typedIdx ? (
              <span className="text-amber-500 text-2xl">_</span>
            ) : letter}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow p-4 text-center w-full">
        <p className="text-slate-500 text-sm font-medium">
          {typedIdx < currentWord.text.length ? (
            <>Tape la lettre <span className={`font-black text-lg ${mode==='assisted'?'text-violet-600':'text-emerald-500'}`}>{currentWord.text[typedIdx]}</span></>
          ) : '✓ Mot complet !'}
        </p>
        {mode === 'assisted' && <p className="text-slate-300 text-xs mt-1">Utilise ton clavier physique</p>}
      </div>

      {mode === 'assisted' && <HintButton onHint={handleHint} used={hintUsed} />}
    </div>
  );
}
