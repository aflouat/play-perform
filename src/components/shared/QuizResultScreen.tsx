'use client';

import React from 'react';
import type { QuizAnswer, QuizQuestion, Score } from '@/types';
import { XpGainToast, useXpGain } from '@/components/ui/XpGainToast';

interface QuizResultScreenProps {
  answers: QuizAnswer[];
  questions: QuizQuestion[];
  score: Score;
  xpToNextLevel: number;
  lastGain: number | null;
  onReplay: () => void;
  onHome: () => void;
}

const XP_PER_LEVEL = 100;

export function QuizResultScreen({
  answers, questions, score, xpToNextLevel, lastGain, onReplay, onHome,
}: QuizResultScreenProps) {
  const finalCorrect = answers.filter((a) => a.isCorrect).length;
  const totalXp = answers
    .filter((a) => a.isCorrect)
    .reduce((s, a) => s + (questions.find((q) => q.id === a.questionId)?.xpReward ?? 0), 0);

  const xpPct = Math.round(((XP_PER_LEVEL - xpToNextLevel) / XP_PER_LEVEL) * 100);

  // Wrong answers first, then correct
  const sorted = [...answers].sort((a, b) => (a.isCorrect ? 1 : 0) - (b.isCorrect ? 1 : 0));
  const wrongAnswers = sorted.filter((a) => !a.isCorrect);
  const rightAnswers = sorted.filter((a) => a.isCorrect);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <XpGainToast gain={lastGain} />
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="text-7xl">
          {finalCorrect === questions.length ? '🏆' : finalCorrect >= 2 ? '👏' : '💪'}
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#1a1a2e]">
            {finalCorrect === questions.length ? 'Parfait !' : 'Bien joué !'}
          </h1>
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
            <span>{xpToNextLevel} XP → niv.{score.level + 1}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-1000" style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        {/* Wrong answers first — with correct answer hint */}
        {wrongAnswers.length > 0 && (
          <div className="text-left space-y-2">
            <p className="text-xs font-bold text-rose-500 uppercase tracking-wide">À retravailler</p>
            {wrongAnswers.map((a) => {
              const q = questions.find((qq) => qq.id === a.questionId);
              const correctOption = q?.options.find((o) => o.id === q.correctOptionId);
              return (
                <div key={a.questionId} className="rounded-2xl bg-rose-50 border border-rose-100 p-3 text-left">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">❌</span>
                    <div>
                      <p className="text-slate-700 text-xs leading-snug">{q?.question}</p>
                      <p className="text-emerald-600 text-xs mt-1 font-semibold">
                        ✓ {correctOption?.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Correct answers summary */}
        {rightAnswers.length > 0 && (
          <div className="text-left space-y-1.5">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Maîtrisé</p>
            {rightAnswers.map((a) => {
              const q = questions.find((qq) => qq.id === a.questionId);
              return (
                <div key={a.questionId} className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                  <span className="shrink-0">✅</span>
                  <span className="text-slate-600 text-xs leading-snug">{q?.question}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onHome} className="flex-1 rounded-2xl bg-slate-100 py-4 font-bold text-slate-600 hover:bg-slate-200 transition-colors">Accueil</button>
          <button onClick={onReplay} className="flex-1 rounded-2xl bg-sky-500 py-4 font-bold text-white shadow-lg hover:bg-sky-400 transition-colors">Rejouer</button>
        </div>
      </div>
    </div>
  );
}
