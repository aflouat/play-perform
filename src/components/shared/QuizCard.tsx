'use client';

import React from 'react';
import type { QuizQuestion, QuizOptionId, QuizOption, QuizDifficulty } from '@/types';
import { DIFFICULTY_META } from '@/types';
import type { LearningMode } from '@/lib/learning-mode';
import { HintButton } from '@/components/ui/HintButton';
import { QuizTimer } from '@/components/ui/QuizTimer';
import { speakInstruction } from '@/lib/audio';
import { useQuizCard } from '@/hooks/useQuizCard';
import clsx from 'clsx';

export const QUIZ_TIMER_SECONDS = 30;

interface QuizCardProps {
  question: QuizQuestion;
  mode?: LearningMode;
  onAnswer: (optionId: QuizOptionId, timeMs: number) => void;
  onSpeak?: (text: string) => void;
}

export function QuizCard({
  question,
  mode = 'advanced',
  onAnswer,
  onSpeak,
}: QuizCardProps) {
  const { selected, revealed, hintUsed, eliminatedId, handleSelect, handleTimeout, handleHint, getOptionStyle, getOptionIcon } =
    useQuizCard(question, mode, onAnswer);

  const displayQuestion =
    mode === 'assisted' && question.questionAssisted
      ? question.questionAssisted : question.question;

  const displayExplanation =
    mode === 'assisted' && question.explanationAssisted
      ? question.explanationAssisted : question.explanation;

  const displayOptionText = (opt: QuizOption) =>
    mode === 'assisted' && opt.textAssisted ? opt.textAssisted : opt.text;

  const diff = DIFFICULTY_META[question.difficulty as QuizDifficulty];

  return (
    <div className={clsx('space-y-4', mode === 'assisted' && 'space-y-5')}>
      <div className={clsx('relative rounded-2xl bg-white shadow-md p-5', mode === 'assisted' && 'p-6 border-2 border-violet-100')}>
        {/* Timer — top-right */}
        {!revealed && (
          <div className="absolute top-3 right-3">
            <QuizTimer key={question.id} duration={QUIZ_TIMER_SECONDS} onTimeout={handleTimeout} />
          </div>
        )}

        {question.emoji && (
          <div className={clsx('text-center mb-3', mode === 'assisted' ? 'text-6xl' : 'text-4xl')}>
            {question.emoji}
          </div>
        )}
        {question.imageUrl && (
          <div className="mb-3 rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={question.imageUrl} alt="" className="w-full max-h-40 object-contain" />
          </div>
        )}
        <div className="flex items-start gap-3 pr-14">
          <p className={clsx('text-[#1a1a2e] font-bold leading-snug flex-1', mode === 'assisted' ? 'text-xl' : 'text-lg')}>
            {displayQuestion}
          </p>
          {(onSpeak || mode === 'assisted') && (
            <button onClick={() => onSpeak ? onSpeak(displayQuestion) : speakInstruction(displayQuestion)}
              aria-label="Lire la question à voix haute"
              className="shrink-0 w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-500 hover:bg-violet-100 transition-colors">
              🔊
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className={clsx('text-xs font-bold text-white px-2 py-0.5 rounded-full', diff.color)}>
            {diff.icon} {diff.label}
          </span>
          <span className="text-slate-200">·</span>
          <span className="text-xs text-amber-500 font-bold">+{question.xpReward} XP</span>
          {mode === 'assisted' && !revealed && (
            <span className="ml-auto"><HintButton onHint={handleHint} used={hintUsed} size="sm" /></span>
          )}
        </div>
      </div>

      {mode === 'assisted' && hintUsed && !revealed && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-start gap-2">
          <span className="text-amber-500 mt-0.5">💡</span>
          <span className="text-amber-700 text-sm font-medium leading-snug">
            {question.hint
              ? question.hint
              : 'Une mauvaise réponse a été éliminée. Écoute la question encore !'}
          </span>
        </div>
      )}

      <div className="space-y-2.5">
        {question.options.map((option) => (
          <button key={option.id} onClick={() => handleSelect(option.id)}
            disabled={revealed || option.id === eliminatedId}
            aria-pressed={selected === option.id}
            className={clsx(
              'w-full text-left rounded-2xl px-5 py-4 font-semibold shadow-sm transition-all duration-200',
              getOptionStyle(option.id),
              !revealed && option.id !== eliminatedId && 'active:scale-[0.98] hover:shadow-md',
              mode === 'assisted' && 'py-5 text-base',
            )}>
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                {getOptionIcon(option.id) || option.id}
              </span>
              <span className="leading-snug">{displayOptionText(option)}</span>
            </div>
          </button>
        ))}
      </div>

      {revealed && (
        <div className={clsx('rounded-2xl p-4 text-sm leading-relaxed shadow-sm',
          selected === question.correctOptionId
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-rose-50 border border-rose-200 text-rose-700')}
          role="alert">
          <span className="font-bold mr-1">{selected === question.correctOptionId ? '✓ Bravo !' : '✕ Pas tout à fait.'}</span>
          <span className="text-slate-600">{displayExplanation}</span>
        </div>
      )}
    </div>
  );
}
