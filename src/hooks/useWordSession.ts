'use client';

import { useState, useCallback, useEffect } from 'react';
import { buildWordChallenge, type WordLang, type WordCard, type WordChallenge } from '@/lib/word-data';
import { playSound, speakEnthusiastic, speakInstruction } from '@/lib/audio';
import type { LearningMode } from '@/lib/learning-mode';
import type { XpGain } from '@/types';

const SESSION_LENGTH = 6;
type Feedback = 'idle' | 'correct' | 'wrong';

function buildSession(lang: WordLang): WordChallenge[] {
  return Array.from({ length: SESSION_LENGTH }, () => buildWordChallenge(lang));
}

function toLangCode(lang: WordLang): string {
  return lang === 'fr' ? 'fr-FR' : lang === 'en' ? 'en-GB' : 'es-ES';
}

interface UseWordSessionParams {
  mode: LearningMode;
  addXp: (amount: number, reason: XpGain['reason']) => void;
  triggerGain: (amount: number) => void;
}

export function useWordSession({ mode, addXp, triggerGain }: UseWordSessionParams) {
  const [lang, setLang] = useState<WordLang>('fr');
  const [challenges, setChallenges] = useState(() => buildSession('fr'));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scoreGame, setScoreGame] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [dimmedId, setDimmedId] = useState<string | null>(null);

  const current = challenges[currentIdx];

  useEffect(() => {
    setHintUsed(false); setDimmedId(null);
    if (current && mode === 'assisted') speakInstruction(current.target.word, toLangCode(lang));
  }, [currentIdx, current?.target?.id, mode, lang]);

  function handleLangChange(l: WordLang) {
    setLang(l); setChallenges(buildSession(l)); setCurrentIdx(0); setScoreGame(0);
    setFeedback('idle'); setSelectedId(null); setFinished(false); setHintUsed(false); setDimmedId(null);
  }

  function handleHint() {
    if (hintUsed || feedback !== 'idle' || !current) return;
    setHintUsed(true);
    const wrong = current.options.filter(o => o.id !== current.target.id);
    if (wrong.length > 0) setDimmedId(wrong[0].id);
    speakInstruction(current.target.word, toLangCode(lang));
  }

  const handleSelect = useCallback((option: WordCard) => {
    if (feedback !== 'idle' || option.id === dimmedId) return;
    const correct = option.id === current.target.id;
    setSelectedId(option.id);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      playSound('correct'); addXp(8, 'quiz-correct'); triggerGain(8); setScoreGame(s => s + 1);
      speakEnthusiastic(current.target.word, toLangCode(lang));
    } else {
      playSound('wrong'); speakInstruction(current.target.word, toLangCode(lang));
    }
    setTimeout(() => {
      if (currentIdx < SESSION_LENGTH - 1) {
        setCurrentIdx(i => i + 1); setFeedback('idle'); setSelectedId(null); setHintUsed(false); setDimmedId(null);
      } else { playSound('complete'); setFinished(true); }
    }, 1200);
  }, [feedback, current, currentIdx, addXp, triggerGain, lang, dimmedId]);

  function restart() {
    setChallenges(buildSession(lang)); setCurrentIdx(0); setScoreGame(0);
    setFeedback('idle'); setSelectedId(null); setFinished(false); setHintUsed(false); setDimmedId(null);
  }

  function optionStyle(option: WordCard): string {
    if (option.id === dimmedId && feedback === 'idle') return 'bg-slate-50 border-2 border-slate-100 opacity-30 cursor-not-allowed line-through';
    if (feedback === 'idle') return 'bg-white shadow-md hover:shadow-lg border-2 border-transparent hover:border-pink-200 active:scale-[0.98]';
    if (option.id === current.target.id) return 'bg-emerald-50 border-2 border-emerald-400 shadow';
    if (option.id === selectedId) return 'bg-rose-50 border-2 border-rose-400 shadow';
    return 'bg-white opacity-40 border-2 border-transparent';
  }

  return {
    lang, challenges, currentIdx, current, scoreGame, feedback,
    selectedId, finished, hintUsed, dimmedId,
    handleLangChange, handleHint, handleSelect, restart, optionStyle,
    sessionLength: SESSION_LENGTH,
  };
}
