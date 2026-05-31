'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getChallengesForLevel, getLevelLabel, type KeyboardLevel } from '@/lib/keyboard-data';
import { playSound, speakEnthusiastic, speakInstruction } from '@/lib/audio';
import { useScore } from '@/hooks/useScore';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { HintButton } from '@/components/ui/HintButton';
import type { LearningMode } from '@/lib/learning-mode';

type Feedback = 'idle' | 'correct' | 'wrong';

interface Props { profileId: string; mode: LearningMode; onFinish: () => void; }

const ROW_LABEL: Record<KeyboardLevel, string> = {
  1: 'rangée du milieu (ASDFJKL)',
  2: 'rangée du haut (QWERTYUIOP)',
  3: 'rangée du bas (ZXCVBNM)',
  4: 'tout le clavier',
};

export function LetterMode({ profileId, mode, onFinish }: Props) {
  const [level, setLevel] = useState<KeyboardLevel>(1);
  const [challenges, setChallenges] = useState(() => getChallengesForLevel(1, 8));
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [score, setScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showRow, setShowRow] = useState(false);
  const { addXp } = useScore(profileId);
  const { lastGain, popKey, triggerGain } = useXpGain();

  const current = challenges[idx];

  useEffect(() => {
    const c = getChallengesForLevel(level, 8);
    setChallenges(c); setIdx(0); setFeedback('idle'); setScore(0);
  }, [level]);

  useEffect(() => {
    setHintUsed(false); setShowRow(false);
    if (!current) return;
    if (mode === 'assisted') {
      speakInstruction(`Lettre ${current.letter}. ${current.word}`);
    }
  }, [current?.id, mode]);

  const next = useCallback(() => {
    if (idx < challenges.length - 1) { setIdx((i) => i + 1); setFeedback('idle'); }
    else { playSound('complete'); onFinish(); }
  }, [idx, challenges.length, onFinish]);

  const handleCorrect = useCallback(() => {
    if (feedback !== 'idle') return;
    setFeedback('correct');
    setScore((s) => s + 1);
    addXp(5, 'quiz-correct');
    triggerGain(5);
    playSound('correct');
    speakEnthusiastic(current.word);
    setTimeout(next, 900);
  }, [feedback, current, addXp, triggerGain, next]);

  const handleWrong = useCallback(() => {
    if (feedback !== 'idle') return;
    setFeedback('wrong');
    playSound('wrong');
    setTimeout(() => setFeedback('idle'), 650);
  }, [feedback]);

  function handleHint() {
    if (hintUsed || !current) return;
    setHintUsed(true);
    setShowRow(true);
    speakInstruction(`Cherche la lettre ${current.letter} comme ${current.word}. Elle est sur la ${ROW_LABEL[level]}.`);
  }

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === current.key) handleCorrect();
      else if (/^[a-z]$/.test(e.key.toLowerCase())) handleWrong();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, handleCorrect, handleWrong]);

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
