'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScore } from '@/hooks/useScore';
import { useAvatar } from '@/hooks/useAvatar';
import { useLearningMode } from '@/hooks/useLearningMode';
import { clearActiveProfile, getActiveProfileId } from '@/lib/profiles';
import { buildWordChallenge, LANG_LABELS, type WordLang, type WordCard } from '@/lib/word-data';
import { playSound, speakEnthusiastic, speakInstruction } from '@/lib/audio';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { HintButton } from '@/components/ui/HintButton';
import { ProfileHeader } from '@/components/shared/ProfileHeader';

const SESSION_LENGTH = 6;
type Feedback = 'idle' | 'correct' | 'wrong';

function buildSession(lang: WordLang) {
  return Array.from({ length: SESSION_LENGTH }, () => buildWordChallenge(lang));
}

export default function EsmaPage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string>('esma');
  useEffect(() => {
    const id = getActiveProfileId();
    if (!id) { router.replace('/'); return; }
    setProfileId(id);
  }, [router]);

  const { score, xpToNextLevel, addXp } = useScore(profileId);
  const { avatar } = useAvatar(profileId, score.xp);
  const { mode, setMode } = useLearningMode(profileId);
  const { lastGain, popKey, triggerGain } = useXpGain();

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
    if (current && mode === 'assisted') speakInstruction(current.target.word, lang==='fr'?'fr-FR':lang==='en'?'en-GB':'es-ES');
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
    speakInstruction(current.target.word, lang==='fr'?'fr-FR':lang==='en'?'en-GB':'es-ES');
  }

  const handleSelect = useCallback((option: WordCard) => {
    if (feedback !== 'idle' || option.id === dimmedId) return;
    const correct = option.id === current.target.id;
    setSelectedId(option.id);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      playSound('correct'); addXp(8,'quiz-correct'); triggerGain(8); setScoreGame(s=>s+1);
      speakEnthusiastic(current.target.word, lang==='fr'?'fr-FR':lang==='en'?'en-GB':'es-ES');
    } else {
      playSound('wrong'); speakInstruction(current.target.word, lang==='fr'?'fr-FR':lang==='en'?'en-GB':'es-ES');
    }
    setTimeout(() => {
      if (currentIdx < SESSION_LENGTH - 1) {
        setCurrentIdx(i=>i+1); setFeedback('idle'); setSelectedId(null); setHintUsed(false); setDimmedId(null);
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

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 text-center">
        <XpGainToast gain={lastGain} />
        <div className="w-full max-w-sm space-y-6">
          <div className="text-7xl">{scoreGame===SESSION_LENGTH?'🌟':scoreGame>=4?'🎀':'💪'}</div>
          <h1 className="text-3xl font-black text-[#1a1a2e]">{scoreGame===SESSION_LENGTH?'Parfait, Esma !':'Bien joué !'}</h1>
          <p className={`text-3xl font-black text-pink-500 score-pop`} key={popKey}>{scoreGame}/{SESSION_LENGTH}</p>
          <div className="flex gap-3">
            <button onClick={() => { clearActiveProfile(); router.push('/'); }} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600">Accueil</button>
            <button onClick={restart} className="flex-1 rounded-2xl bg-pink-500 py-4 font-bold text-white shadow-lg">Rejouer !</button>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            {(Object.keys(LANG_LABELS) as WordLang[]).map(l => (
              <button key={l} onClick={() => { handleLangChange(l); }}
                className={`rounded-xl px-3 py-1.5 text-sm font-bold ${lang===l?'bg-pink-500 text-white shadow':'bg-white text-slate-500 shadow-sm'}`}>
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <XpGainToast gain={lastGain} />
      <div className="max-w-sm mx-auto w-full px-5 pt-8 pb-6 flex-1 flex flex-col">
        <ProfileHeader
          name="Esma"
          avatarEmoji={avatar?.emoji ?? '🌸'}
          score={score}
          xpToNextLevel={xpToNextLevel}
          mode={mode}
          onModeChange={setMode}
          onBack={() => { clearActiveProfile(); router.push('/'); }}
          accentColor="bg-pink-400"
        />

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {(Object.keys(LANG_LABELS) as WordLang[]).map(l => (
              <button key={l} onClick={() => handleLangChange(l)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${lang===l?'bg-pink-500 text-white':'bg-white text-slate-400 shadow-sm'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className={`rounded-xl bg-pink-50 border border-pink-100 px-3 py-1.5 score-pop`} key={popKey}>
            <span className="text-pink-600 text-sm font-black">{scoreGame}/{SESSION_LENGTH}</span>
          </div>
        </div>

        <div className="flex gap-1.5 mb-5">
          {challenges.map((_,i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${i<currentIdx?'bg-pink-400':i===currentIdx?'bg-pink-200':'bg-slate-200'}`}/>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-4 items-center">
          <div className={`w-full rounded-3xl bg-white shadow-xl text-center ${mode==='assisted'?'p-10 border-2 border-violet-100':'p-8'}`}>
            <div className={mode==='assisted'?'text-9xl mb-3':'text-8xl mb-3'}>{current.target.emoji}</div>
            <p className="text-slate-400 text-sm">Quel est ce mot ?</p>
          </div>

          <div className="flex gap-2 w-full">
            <button onClick={() => speakInstruction(current.target.word, lang==='fr'?'fr-FR':lang==='en'?'en-GB':'es-ES')}
              className="flex-1 rounded-2xl bg-white shadow px-4 py-2.5 flex items-center justify-center gap-2 text-slate-600 font-semibold hover:shadow-md transition-shadow text-sm">
              🔊 Écouter
            </button>
            {mode === 'assisted' && <HintButton onHint={handleHint} used={hintUsed} />}
          </div>

          {mode === 'assisted' && hintUsed && (
            <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-amber-700 text-xs flex items-center gap-2">
              <span>💡</span><span>Une mauvaise réponse est barrée. Écoute le mot !</span>
            </div>
          )}

          <div className="w-full grid grid-cols-1 gap-3">
            {current.options.map(option => (
              <button key={option.id} onClick={() => handleSelect(option)}
                disabled={feedback!=='idle' || option.id===dimmedId}
                className={`w-full rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 ${optionStyle(option)} ${mode==='assisted'?'p-5':''}`}>
                <span className="text-3xl">{option.emoji}</span>
                <span className={`text-[#1a1a2e] font-black ${mode==='assisted'?'text-2xl':'text-xl'}`}>{option.word}</span>
                {feedback!=='idle' && option.id===current.target.id && <span className="ml-auto text-emerald-500 font-black">✓</span>}
                {feedback!=='idle' && option.id===selectedId && option.id!==current.target.id && <span className="ml-auto text-rose-500 font-black">✕</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
