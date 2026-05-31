'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { Subject, QuizQuestion, QuizAnswer, QuizOptionId } from '@/types';
import type { LearningMode } from '@/lib/learning-mode';
import { QuizCard, QUIZ_TIMER_SECONDS } from '@/components/shared/QuizCard';
import { ProfileHeader } from '@/components/shared/ProfileHeader';
import { useScore } from '@/hooks/useScore';
import { useAvatar } from '@/hooks/useAvatar';
import { useLearningMode } from '@/hooks/useLearningMode';
import { getSubjectLabel, QUIZ_SUBJECTS } from '@/lib/quiz-data';
import { getQuestions } from '@/lib/question-banks';
import { playSound, speakEnthusiastic } from '@/lib/audio';
import { getActiveProfileId, getProfileById } from '@/lib/profiles';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

const SUBJECT_BG: Record<string, string> = {
  maths: 'bg-sky-400', francais: 'bg-violet-400', svt: 'bg-emerald-400',
  histoire: 'bg-amber-400', physique: 'bg-rose-400',
  espace: 'bg-indigo-400', meteo: 'bg-cyan-400', chimie: 'bg-lime-500',
  mecanique: 'bg-orange-400', geo: 'bg-teal-400', anglais: 'bg-blue-400',
  espagnol: 'bg-red-400', informatique: 'bg-slate-500', telecom: 'bg-purple-400',
};

const ALL_SUBJECTS: Subject[] = [
  'maths','francais','svt','histoire','physique',
  'espace','meteo','chimie','mecanique','geo','anglais','espagnol','informatique','telecom',
];

function isValidSubject(s: string): s is Subject {
  return ALL_SUBJECTS.includes(s as Subject);
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subject = params.subject as string;

  const [profileId, setProfileId] = useState<string>('__none__');
  useEffect(() => {
    const id = getActiveProfileId();
    if (!id) { router.replace('/'); return; }
    setProfileId(id);
  }, [router]);

  const { score, xpToNextLevel, addXp } = useScore(profileId);
  const { avatar } = useAvatar(profileId, score.xp);
  const { mode, setMode } = useLearningMode(profileId);
  const { lastGain, triggerGain } = useXpGain();
  const profile = getProfileById(profileId);

  const validSubject = isValidSubject(subject) ? (subject as Subject) : 'maths';
  const { getQuestions: srsSelect, recordAnswer, computeSubjectStats } = useSpacedRepetition(profileId, validSubject);
  const allForSubject = isValidSubject(subject) ? getQuestions(subject as Subject) : [];

  // sessionKey forces SRS re-selection on Rejouer
  const [sessionKey, setSessionKey] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (profileId === '__none__' || allForSubject.length === 0) return;
    setQuestions(isValidSubject(subject) ? srsSelect(allForSubject, 5) : []);
    setCurrentIndex(0);
    setAnswers([]);
    setFinished(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, profileId]);

  const stats = computeSubjectStats(allForSubject);

  const handleAnswer = useCallback((optionId: QuizOptionId, timeMs: number) => {
    const q = questions[currentIndex];
    const isCorrect = optionId === q.correctOptionId;
    if (isCorrect) {
      const elapsed = timeMs / 1000;
      const multiplier = Math.max(0.3, 1 - (0.7 * elapsed / QUIZ_TIMER_SECONDS));
      const xpEarned = Math.round(q.xpReward * multiplier);
      playSound('correct'); addXp(xpEarned, 'quiz-correct'); triggerGain(xpEarned); speakEnthusiastic('');
    } else { playSound('wrong'); }
    recordAnswer(q.id, isCorrect);
    const answer: QuizAnswer = { questionId: q.id, selectedOptionId: optionId, isCorrect, timeMs };
    setAnswers(prev => {
      const next = [...prev, answer];
      if (currentIndex >= questions.length - 1) {
        if (next.every(a=>a.isCorrect)) { addXp(20,'quiz-perfect'); triggerGain(20); }
        playSound('complete');
        setTimeout(() => setFinished(true), 1000);
      } else {
        setTimeout(() => setCurrentIndex(i=>i+1), 1200);
      }
      return next;
    });
  }, [currentIndex, questions, addXp, triggerGain]);

  if (!isValidSubject(subject)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-4">🤔</div>
        <p className="text-slate-500">Matière introuvable.</p>
        <button onClick={() => router.push('/home')} className="mt-6 text-sky-500 font-semibold">← Retour</button>
      </div>
    );
  }
  // Loading state — profileId initializes as '__none__' then gets set via useEffect
  if (profileId === '__none__' || questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  }

  const correctSoFar = answers.filter(a=>a.isCorrect).length;
  const XP_PER_LEVEL = 100;
  const xpInLevel = XP_PER_LEVEL - xpToNextLevel;
  const xpPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
  const subjectBg = SUBJECT_BG[subject] ?? 'bg-slate-400';

  if (finished) {
    const finalCorrect = answers.filter(a=>a.isCorrect).length;
    const totalXp = answers.filter(a=>a.isCorrect).reduce((s,a) => {
      const q = questions.find(qq=>qq.id===a.questionId);
      return s + (q?.xpReward ?? 0);
    }, 0);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
        <XpGainToast gain={lastGain} />
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="text-7xl">{finalCorrect===questions.length?'🏆':finalCorrect>=2?'👏':'💪'}</div>
          <div>
            <h1 className="text-3xl font-black text-[#1a1a2e]">{finalCorrect===questions.length?'Parfait !':'Bien joué !'}</h1>
            <p className="text-slate-500 mt-1">{finalCorrect}/{questions.length} bonnes réponses</p>
            {totalXp > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-2">
                <span className="text-amber-500 font-black text-lg">+{totalXp} XP</span>
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-white shadow-md p-4">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold text-[#1a1a2e]">Niveau {score.level}</span>
              <span>{xpToNextLevel} XP → niv.{score.level+1}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-1000" style={{width:`${xpPct}%`}} />
            </div>
          </div>
          <div className="space-y-2">
            {answers.map((a,i) => {
              const q = questions[i];
              return (
                <div key={a.questionId} className={`flex items-start gap-3 rounded-2xl p-3 text-left ${a.isCorrect?'bg-emerald-50 border border-emerald-100':'bg-rose-50 border border-rose-100'}`}>
                  <span className="shrink-0">{a.isCorrect?'✅':'❌'}</span>
                  <span className="text-slate-600 text-xs leading-snug">{q.question}</span>
                </div>
              );
            })}
          </div>
          {/* SRS stats */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 grid grid-cols-3 gap-3 text-center">
            <div><div className="text-lg font-black text-slate-400">{stats.newCount}</div><div className="text-xs text-slate-400">Nouvelles</div></div>
            <div><div className="text-lg font-black text-amber-500">{stats.dueCount}</div><div className="text-xs text-slate-400">À revoir</div></div>
            <div><div className="text-lg font-black text-emerald-500">{stats.masteredCount}</div><div className="text-xs text-slate-400">Maîtrisées</div></div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/home')} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 hover:bg-slate-200 transition-colors">Accueil</button>
            <button onClick={() => setSessionKey(k => k + 1)} className="flex-1 rounded-2xl bg-sky-500 py-4 font-bold text-white shadow-lg hover:bg-sky-400 transition-colors">Rejouer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <XpGainToast gain={lastGain} />
      <div className="max-w-md mx-auto px-5 pt-8 pb-10">
        <ProfileHeader
          name={profile?.name ?? profileId}
          avatarEmoji={avatar?.emoji ?? '🎓'}
          score={score}
          xpToNextLevel={xpToNextLevel}
          mode={mode}
          onModeChange={setMode}
          onBack={() => router.push('/home')}
          accentColor={subjectBg}
        />

        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm font-semibold">{getSubjectLabel(subject as Subject)}</span>
          {correctSoFar > 0 && <span className="text-emerald-500 text-sm font-semibold">✓ {correctSoFar} correct{correctSoFar>1?'s':''}</span>}
        </div>

        <div className="flex items-center gap-2 mb-5">
          {questions.map((_,i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-500 ${i<currentIndex?subjectBg:i===currentIndex?`${subjectBg} opacity-40`:'bg-slate-200'}`} />
          ))}
        </div>

        <QuizCard
          question={questions[currentIndex]}
          questionIndex={currentIndex}
          totalQuestions={questions.length}
          mode={mode}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}
