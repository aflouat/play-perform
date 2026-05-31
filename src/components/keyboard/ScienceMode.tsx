'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { getScienceQuestions, type ScienceQuestion } from '@/lib/science-data';
import { playSound, speakEnthusiastic, speakInstruction } from '@/lib/audio';
import { useScore } from '@/hooks/useScore';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { HintButton } from '@/components/ui/HintButton';
import type { LearningMode } from '@/lib/learning-mode';

interface Props { profileId: string; mode: LearningMode; onFinish: () => void; }

export function ScienceMode({ profileId, mode, onFinish }: Props) {
  const [questions] = useState<ScienceQuestion[]>(() => getScienceQuestions(5));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [eliminatedIdx, setEliminatedIdx] = useState<number | null>(null);
  const { addXp } = useScore(profileId);
  const { lastGain, popKey, triggerGain } = useXpGain();

  const current = questions[idx];

  useEffect(() => {
    setSelected(null); setRevealed(false); setHintUsed(false); setEliminatedIdx(null);
    if (mode === 'assisted' && current) speakInstruction(current.question);
  }, [idx, mode, current?.id]);

  const handleSelect = useCallback((optionIdx: number) => {
    if (revealed || optionIdx === eliminatedIdx) return;
    setSelected(optionIdx);
    setRevealed(true);
    const isCorrect = optionIdx === current.correctIndex;
    if (isCorrect) {
      playSound('correct'); addXp(15, 'quiz-correct'); triggerGain(15); setScore(s=>s+1);
      speakEnthusiastic(current.explanation);
    } else {
      playSound('wrong'); speakInstruction(current.explanation);
    }
  }, [revealed, current, eliminatedIdx, addXp, triggerGain]);

  function handleHint() {
    if (hintUsed || revealed || !current) return;
    setHintUsed(true);
    const wrongs = current.options
      .map((_, i) => i)
      .filter(i => i !== current.correctIndex);
    setEliminatedIdx(wrongs[Math.floor(Math.random() * wrongs.length)]);
    speakInstruction(`Indice : pense à ce qui se passe dehors tous les jours. ${current.question}`);
  }

  const handleNext = useCallback(() => {
    if (idx < questions.length - 1) setIdx(i=>i+1);
    else { playSound('complete'); onFinish(); }
  }, [idx, questions.length, onFinish]);

  if (!current) return null;

  function optionStyle(i: number): string {
    if (i === eliminatedIdx && !revealed) return 'bg-slate-50 border-2 border-slate-100 opacity-30 line-through text-slate-300 cursor-not-allowed';
    if (!revealed) return `bg-white border-2 border-slate-100 hover:border-sky-300 hover:shadow-md ${mode==='assisted'?'py-5':''}`;
    if (i === current.correctIndex) return 'bg-emerald-50 border-2 border-emerald-400';
    if (i === selected) return 'bg-rose-50 border-2 border-rose-400';
    return 'bg-white border-2 border-slate-100 opacity-40';
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <XpGainToast gain={lastGain} />

      <div className="flex justify-between items-center">
        <div className={`text-3xl font-black text-sky-500 score-pop`} key={popKey}>{score}/{questions.length}</div>
        <div className="flex gap-1">
          {questions.map((_,i) => (
            <div key={i} className={`flex-1 h-2 rounded-full w-8 ${i<idx?'bg-sky-400':i===idx?'bg-sky-200':'bg-slate-200'}`}/>
          ))}
        </div>
      </div>

      <div className={`rounded-3xl bg-white shadow-xl p-6 text-center ${mode==='assisted'?'border-2 border-violet-100':''}`}>
        <div className={mode==='assisted'?'text-7xl mb-3':'text-6xl mb-3'}>{current.emoji}</div>
        <p className={`text-[#1a1a2e] font-bold leading-snug ${mode==='assisted'?'text-xl':'text-lg'}`}>{current.question}</p>
        {mode === 'assisted' && (
          <button onClick={() => speakInstruction(current.question)}
            className="mt-3 rounded-xl bg-violet-50 border border-violet-200 px-4 py-2 text-violet-500 text-sm font-semibold hover:bg-violet-100 transition-colors">
            🔊 Écouter
          </button>
        )}
      </div>

      {mode === 'assisted' && !revealed && (
        <div className="flex justify-center">
          <HintButton onHint={handleHint} used={hintUsed} />
        </div>
      )}

      {hintUsed && !revealed && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-amber-700 text-sm flex items-center gap-2">
          <span>💡</span><span>Une mauvaise réponse est barrée. Réfléchis bien !</span>
        </div>
      )}

      <div className="space-y-2.5">
        {current.options.map((opt, i) => (
          <button key={i} onClick={() => handleSelect(i)} disabled={revealed || i === eliminatedIdx}
            className={`w-full rounded-2xl p-4 text-left font-semibold text-[#1a1a2e] transition-all duration-200 flex items-center gap-3 ${optionStyle(i)}`}>
            <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-500 shrink-0">
              {revealed && i===current.correctIndex?'✓':revealed && i===selected?'✕':['A','B','C'][i]}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {revealed && (
        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4">
          <p className="text-sky-700 text-sm font-semibold mb-1">{current.explanation}</p>
          <p className="text-sky-600 text-xs">{current.fact}</p>
          <button onClick={handleNext} className="mt-3 w-full rounded-xl bg-sky-500 py-3 font-bold text-white shadow hover:bg-sky-400 transition-colors">
            {idx < questions.length-1 ? 'Question suivante →' : 'Terminer !'}
          </button>
        </div>
      )}
    </div>
  );
}
