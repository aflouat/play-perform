'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Subject, QuizQuestion, QuizAnswer, QuizOptionId } from '@/types';
import { QuizCard, QUIZ_TIMER_SECONDS } from '@/components/shared/QuizCard';
import { QuizResultScreen } from '@/components/shared/QuizResultScreen';
import { ProfileHeader } from '@/components/shared/ProfileHeader';
import { useScore } from '@/hooks/useScore';
import { useAvatar } from '@/hooks/useAvatar';
import { useLearningMode } from '@/hooks/useLearningMode';
import { getSubjectLabel } from '@/lib/quiz-data';
import { getQuestions } from '@/lib/question-banks';
import { playSound, speakEnthusiastic } from '@/lib/audio';
import { getActiveProfileId, getProfileById } from '@/lib/profiles';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

const SUBJECT_BG: Record<string, string> = {
  maths: 'bg-sky-400', francais: 'bg-violet-400', svt: 'bg-emerald-400',
  histoire: 'bg-amber-400', physique: 'bg-rose-400', espace: 'bg-indigo-400',
  meteo: 'bg-cyan-400', chimie: 'bg-lime-500', mecanique: 'bg-orange-400',
  geo: 'bg-teal-400', anglais: 'bg-blue-400', espagnol: 'bg-red-400',
  informatique: 'bg-slate-500', telecom: 'bg-purple-400',
};

const ALL_SUBJECTS: Subject[] = [
  'maths','francais','svt','histoire','physique','espace','meteo',
  'chimie','mecanique','geo','anglais','espagnol','informatique','telecom',
];

function isValidSubject(s: string): s is Subject { return ALL_SUBJECTS.includes(s as Subject); }

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
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
  const { getQuestions: srsSelect, recordAnswer } = useSpacedRepetition(profileId, validSubject);
  const allForSubject = isValidSubject(subject) ? getQuestions(subject as Subject) : [];

  const [sessionKey, setSessionKey] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [finished, setFinished] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);

  useEffect(() => {
    if (profileId === '__none__' || allForSubject.length === 0) return;
    setQuestions(isValidSubject(subject) ? srsSelect(allForSubject, 5) : []);
    setCurrentIndex(0); setAnswers([]); setFinished(false);
    setQuestionsLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, profileId]);

  const handleAnswer = useCallback((optionId: QuizOptionId, timeMs: number) => {
    const q = questions[currentIndex];
    const isCorrect = optionId === q.correctOptionId;
    if (isCorrect) {
      const multiplier = Math.max(0.3, 1 - (0.7 * timeMs / 1000 / QUIZ_TIMER_SECONDS));
      const xpEarned = Math.round(q.xpReward * multiplier);
      playSound('correct'); addXp(xpEarned, 'quiz-correct'); triggerGain(xpEarned); speakEnthusiastic('');
    } else { playSound('wrong'); }
    recordAnswer(q.id, isCorrect);
    setAnswers((prev) => {
      const next = [...prev, { questionId: q.id, selectedOptionId: optionId, isCorrect, timeMs }];
      if (currentIndex >= questions.length - 1) {
        if (next.every((a) => a.isCorrect)) { addXp(20, 'quiz-perfect'); triggerGain(20); }
        playSound('complete');
        setTimeout(() => setFinished(true), 1000);
      } else {
        setTimeout(() => setCurrentIndex((i) => i + 1), 1200);
      }
      return next;
    });
  }, [currentIndex, questions, addXp, triggerGain, recordAnswer]);

  if (!isValidSubject(subject)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-4">🤔</div>
        <p className="text-slate-500">Matière introuvable.</p>
        <button onClick={() => router.push('/home')} className="mt-6 text-sky-500 font-semibold">← Retour</button>
      </div>
    );
  }
  if (profileId === '__none__' || !questionsLoaded) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  }
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🌟</div>
        <h2 className="text-2xl font-black text-[#1a1a2e]">Session terminée !</h2>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          Toutes les questions ont été révisées récemment.<br/>
          Reviens dans quelques heures pour respecter<br/>la courbe de mémorisation.
        </p>
        <button onClick={() => router.push('/home')}
          className="mt-6 rounded-2xl bg-sky-500 text-white font-bold px-6 py-3 hover:bg-sky-400 transition-colors">
          ← Accueil
        </button>
      </div>
    );
  }
  if (finished) {
    return <QuizResultScreen answers={answers} questions={questions} score={score}
      xpToNextLevel={xpToNextLevel} lastGain={lastGain}
      onReplay={() => setSessionKey((k) => k + 1)} onHome={() => router.push('/home')} />;
  }

  const subjectBg = SUBJECT_BG[subject] ?? 'bg-slate-400';
  const correctSoFar = answers.filter((a) => a.isCorrect).length;

  return (
    <div className="min-h-screen">
      <XpGainToast gain={lastGain} />
      <div className="max-w-md mx-auto px-5 pt-8 pb-10">
        <ProfileHeader name={profile?.name ?? profileId} avatarEmoji={avatar?.emoji ?? '🎓'}
          score={score} xpToNextLevel={xpToNextLevel} mode={mode} onModeChange={setMode}
          onBack={() => router.push('/home')} accentColor={subjectBg} />
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm font-semibold">{getSubjectLabel(subject as Subject)}</span>
          {correctSoFar > 0 && <span className="text-emerald-500 text-sm font-semibold">✓ {correctSoFar} correct{correctSoFar > 1 ? 's' : ''}</span>}
        </div>
        <div className="flex items-center gap-2 mb-5">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-500 ${i < currentIndex ? subjectBg : i === currentIndex ? `${subjectBg} opacity-40` : 'bg-slate-200'}`} />
          ))}
        </div>
        <QuizCard question={questions[currentIndex]} questionIndex={currentIndex}
          totalQuestions={questions.length} mode={mode} onAnswer={handleAnswer} />
      </div>
    </div>
  );
}
