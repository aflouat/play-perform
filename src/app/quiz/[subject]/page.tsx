'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Subject } from '@/types';
import { QuizCard } from '@/components/shared/QuizCard';
import { QuizResultScreen } from '@/components/shared/QuizResultScreen';
import { ProfileHeader } from '@/components/shared/ProfileHeader';
import { useScore } from '@/hooks/useScore';
import { useAvatar } from '@/hooks/useAvatar';
import { useLearningMode } from '@/hooks/useLearningMode';
import { useQuizSession } from '@/hooks/useQuizSession';
import { useActiveProfileId } from '@/hooks/useActiveProfileId';
import { getSubjectLabel } from '@/lib/quiz-data';
import { getQuestions } from '@/lib/question-banks';
import { getProfileById } from '@/lib/profiles';
import { SUBJECT_META, NAV_SUBJECTS } from '@/lib/subjects';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

function isValidSubject(s: string): s is Subject { return NAV_SUBJECTS.includes(s as Subject); }

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const subject = params.subject as string;

  const profileId = useActiveProfileId();
  useEffect(() => {
    if (profileId === '__none__') router.replace('/');
  }, [profileId, router]);

  const { score, xpToNextLevel, addXp } = useScore(profileId);
  const { avatar } = useAvatar(profileId, score.xp);
  const { mode, setMode } = useLearningMode(profileId);
  const { lastGain, triggerGain } = useXpGain();
  const profile = getProfileById(profileId);

  const validSubject = isValidSubject(subject) ? (subject as Subject) : 'maths';
  const { getQuestions: srsSelect, recordAnswer } = useSpacedRepetition(profileId, validSubject);
  const allForSubject = isValidSubject(subject) ? getQuestions(subject as Subject) : [];

  const { questions, currentIndex, answers, finished, questionsLoaded, handleAnswer, replay, continueAnyway } =
    useQuizSession({ profileId, allForSubject, srsSelect, addXp, triggerGain, recordAnswer });

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
        <h2 className="text-2xl font-black text-[#1a1a2e]">Bravo, tu avances vite !</h2>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          Toutes les questions ont été révisées récemment.<br/>
          L&apos;idéal est de revenir dans quelques heures.
        </p>
        <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
          <button onClick={continueAnyway}
            className="rounded-2xl bg-emerald-500 text-white font-bold px-6 py-3 hover:bg-emerald-400 transition-colors">
            Continuer quand même →
          </button>
          <button onClick={() => router.push('/home')}
            className="rounded-2xl bg-slate-100 text-slate-600 font-bold px-6 py-3 hover:bg-slate-200 transition-colors">
            ← Accueil
          </button>
        </div>
      </div>
    );
  }
  if (finished) {
    return <QuizResultScreen answers={answers} questions={questions} score={score}
      xpToNextLevel={xpToNextLevel} lastGain={lastGain}
      onReplay={replay} onHome={() => router.push('/home')} />;
  }

  const subjectBg = SUBJECT_META[subject as Subject]?.bg ?? 'bg-slate-400';
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
        <QuizCard key={questions[currentIndex].id} question={questions[currentIndex]}
          mode={mode} onAnswer={handleAnswer} />
      </div>
    </div>
  );
}
