'use client';

import { useState, useCallback } from 'react';
import { buildWordChallenge, toSpeechLang, type WordLang, type WordCard, type WordChallenge } from '@/lib/word-data';
import { playSound, speakEnthusiastic, speakInstruction } from '@/lib/audio';
import type { XpGain } from '@/types';

const SESSION_LENGTH = 6;
type Feedback = 'idle' | 'correct' | 'wrong';

function buildSession(lang: WordLang): WordChallenge[] {
  return Array.from({ length: SESSION_LENGTH }, () => buildWordChallenge(lang));
}

interface UseWordSessionParams {
  addXp: (amount: number, reason: XpGain['reason']) => void;
  triggerGain: (amount: number) => void;
}

/**
 * Session de mots d'Esma. L'état par question (indice, option barrée) vit dans
 * <WordChallenge>, remonté via key={current.target.id} — pas d'effet de reset ici.
 */
export function useWordSession({ addXp, triggerGain }: UseWordSessionParams) {
  const [lang, setLang] = useState<WordLang>('fr');
  const [challenges, setChallenges] = useState(() => buildSession('fr'));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scoreGame, setScoreGame] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const current = challenges[currentIdx];

  function handleLangChange(l: WordLang) {
    setLang(l); setChallenges(buildSession(l)); setCurrentIdx(0); setScoreGame(0);
    setFeedback('idle'); setSelectedId(null); setFinished(false);
  }

  const handleSelect = useCallback((option: WordCard) => {
    if (feedback !== 'idle') return;
    const correct = option.id === current.target.id;
    setSelectedId(option.id);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      playSound('correct'); addXp(8, 'quiz-correct'); triggerGain(8); setScoreGame(s => s + 1);
      speakEnthusiastic(current.target.word, toSpeechLang(lang));
    } else {
      playSound('wrong'); speakInstruction(current.target.word, toSpeechLang(lang));
    }
    setTimeout(() => {
      if (currentIdx < SESSION_LENGTH - 1) {
        setCurrentIdx(i => i + 1); setFeedback('idle'); setSelectedId(null);
      } else { playSound('complete'); setFinished(true); }
    }, 1200);
  }, [feedback, current, currentIdx, addXp, triggerGain, lang]);

  function restart() {
    setChallenges(buildSession(lang)); setCurrentIdx(0); setScoreGame(0);
    setFeedback('idle'); setSelectedId(null); setFinished(false);
  }

  return {
    lang, challenges, currentIdx, current, scoreGame, feedback,
    selectedId, finished,
    handleLangChange, handleSelect, restart,
    sessionLength: SESSION_LENGTH,
  };
}
