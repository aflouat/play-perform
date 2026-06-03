'use client';

import React, { useState, useCallback } from 'react';
import type { QuizQuestion, QuizOptionId, Subject, XpGain } from '@/types';
import type { LearningMode } from '@/lib/learning-mode';
import type { DbParcours } from '@/lib/db';
import { QuizCard } from './QuizCard';
import { getQuestions } from '@/lib/question-banks';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';
import { playSound } from '@/lib/audio';
import { SUBJECT_META } from '@/lib/subjects';

const SUBJECT_LABELS: Record<string, string> = {
  maths: 'Maths', francais: 'Français', svt: 'SVT', histoire: 'Histoire',
  physique: 'Physique', anglais: 'Anglais', espagnol: 'Espagnol',
  espace: 'Espace', chimie: 'Chimie', geo: 'Géographie', informatique: 'Informatique',
  mecanique: 'Mécanique', meteo: 'Météo', telecom: 'Télécoms',
};

function pickQuestions(subject: Subject, n: number): QuizQuestion[] {
  const all = getQuestions(subject);
  return [...all].sort(() => Math.random() - 0.5).slice(0, Math.min(n, all.length));
}

interface Props { parcours: DbParcours; mode: LearningMode; addXp: (amount: number, reason: XpGain['reason']) => void; onDone: () => void }

export function ParcoursSession({ parcours, mode, addXp, onDone }: Props) {
  const subjects = parcours.subjects as Subject[];
  const qps = parcours.questions_per_subject;

  const [subjectIdx, setSubjectIdx] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'transition' | 'done'>('playing');
  const [sessionQuestions] = useState<QuizQuestion[][]>(() => subjects.map((s) => pickQuestions(s, qps)));
  const [qIdx, setQIdx] = useState(0);
  const [correctPerSubject, setCorrectPerSubject] = useState<number[]>(() => subjects.map(() => 0));
  const [totalXp, setTotalXp] = useState(0);
  const { lastGain, triggerGain } = useXpGain();

  const currentSubject = subjects[subjectIdx];
  const currentQuestions = sessionQuestions[subjectIdx] ?? [];
  const currentQuestion = currentQuestions[qIdx];

  const handleAnswer = useCallback((optionId: QuizOptionId) => {
    const isCorrect = optionId === currentQuestion.correctOptionId;
    if (isCorrect) {
      playSound('correct');
      const xp = currentQuestion.xpReward;
      addXp(xp, 'quiz-correct');
      triggerGain(xp);
      setTotalXp((x) => x + xp);
      setCorrectPerSubject((arr) => arr.map((v, i) => i === subjectIdx ? v + 1 : v));
    } else {
      playSound('wrong');
    }
    setTimeout(() => {
      const nextQ = qIdx + 1;
      if (nextQ < currentQuestions.length) {
        setQIdx(nextQ);
      } else {
        const nextS = subjectIdx + 1;
        if (nextS < subjects.length) {
          setPhase('transition');
        } else {
          playSound('levelup');
          setPhase('done');
        }
      }
    }, 1100);
  }, [currentQuestion, qIdx, subjectIdx, currentQuestions.length, subjects.length, addXp, triggerGain]);

  if (phase === 'transition') {
    const nextSubject = subjects[subjectIdx + 1];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-black text-[#1a1a2e]">{SUBJECT_LABELS[currentSubject]} terminé !</h2>
        <p className="text-slate-500 mt-1 text-sm">{correctPerSubject[subjectIdx]} / {currentQuestions.length} correctes</p>
        <div className="mt-6 rounded-2xl bg-violet-50 border border-violet-200 px-6 py-4 text-center">
          <p className="text-xs text-slate-400 font-medium">Prochaine matière</p>
          <p className="text-lg font-black text-violet-700 mt-1">
            {SUBJECT_META[nextSubject]?.emoji} {SUBJECT_LABELS[nextSubject]}
          </p>
        </div>
        <button onClick={() => { setSubjectIdx((i) => i + 1); setQIdx(0); setPhase('playing'); }}
          className="mt-6 rounded-2xl bg-violet-600 text-white font-bold px-8 py-3 hover:bg-violet-700 transition-colors">
          Continuer →
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const totalCorrect = correctPerSubject.reduce((a, b) => a + b, 0);
    const totalQ = sessionQuestions.reduce((a, b) => a + b.length, 0);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-black text-[#1a1a2e]">Parcours terminé !</h2>
        <p className="text-slate-500 mt-1 text-sm">{totalCorrect} / {totalQ} correctes · +{totalXp} XP gagnés</p>
        <div className="mt-6 space-y-2 w-full max-w-xs">
          {subjects.map((s, i) => (
            <div key={s} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
              <span className="text-xl">{SUBJECT_META[s]?.emoji}</span>
              <span className="flex-1 text-sm font-semibold text-slate-700 text-left">{SUBJECT_LABELS[s]}</span>
              <span className="text-sm font-bold text-violet-600">{correctPerSubject[i]}/{sessionQuestions[i]?.length ?? qps}</span>
            </div>
          ))}
        </div>
        <button onClick={onDone}
          className="mt-6 rounded-2xl bg-emerald-500 text-white font-bold px-8 py-3 hover:bg-emerald-400 transition-colors">
          ← Accueil
        </button>
      </div>
    );
  }

  const subjectBg = SUBJECT_META[currentSubject]?.bg ?? 'bg-violet-400';

  return (
    <div className="min-h-screen">
      <XpGainToast gain={lastGain} />
      <div className="max-w-md mx-auto px-5 pt-8 pb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{parcours.emoji} {parcours.name}</span>
          <span className="ml-auto text-xs text-slate-400">{subjectIdx + 1}/{subjects.length} matières</span>
        </div>
        <div className="flex gap-1 mb-4">
          {subjects.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i < subjectIdx ? 'bg-violet-500' : i === subjectIdx ? 'bg-violet-300' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="flex items-center justify-between mb-5">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ${subjectBg} bg-opacity-15`}>
            <span>{SUBJECT_META[currentSubject]?.emoji}</span>
            <span className="text-sm font-bold text-[#1a1a2e]">{SUBJECT_LABELS[currentSubject]}</span>
          </div>
          <span className="text-xs text-slate-400">{qIdx + 1}/{currentQuestions.length}</span>
        </div>
        <div className="flex gap-1 mb-5">
          {currentQuestions.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${i < qIdx ? subjectBg : i === qIdx ? `${subjectBg} opacity-40` : 'bg-slate-200'}`} />
          ))}
        </div>
        {currentQuestion && (
          <QuizCard key={`${currentSubject}-${qIdx}`} question={currentQuestion} mode={mode} onAnswer={(id) => handleAnswer(id)} />
        )}
      </div>
    </div>
  );
}
