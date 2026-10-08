'use client';

import { useState } from 'react';
import type { QuizQuestion } from '@/types';
import type { LearningMode } from '@/lib/learning-mode';
import { recordSkillAnswer } from '../infra/skill-reviews';
import { getSkillById } from '../infra/skills-repository';
import { persistSkillLevel } from '../application/skill-sync';
import { advanceSkillLevel, setSkillLevel, useSkillLevels } from '../application/skill-progress';
import { FLASHCARDS_XP, QUIZ_LENGTH, QUIZ_PASS_XP, isQuizPassed, type SkillActivity } from '../domain/activity';
import { hasQuestionBank, pickSkillQuestions, toFlashcards } from '../infra/skill-content';
import { SkillLevelMeter } from './SkillLevelMeter';
import { SkillQuiz } from './SkillQuiz';
import { Flashcards } from './Flashcards';
import { EvaluationPanel } from './EvaluationPanel';

interface Props {
  skillId: string;
  profileId: string;
  mode: LearningMode;
  addXp: (amount: number, reason: 'quiz-correct' | 'quiz-perfect') => void;
  triggerGain: (amount: number) => void;
}

const ACTIVITIES: { id: SkillActivity; emoji: string; label: string; hint: string }[] = [
  { id: 'quiz', emoji: '❓', label: 'Quiz', hint: `${QUIZ_LENGTH} questions · 4 bonnes réponses = niveau suivant` },
  { id: 'flashcards', emoji: '🗂️', label: 'Flashcards', hint: 'Réviser les notions du niveau' },
  { id: 'evaluation', emoji: '📝', label: 'Évaluation', hint: 'Réponse rédigée, corrigée par un examinateur' },
];

/** A skill: level first, then the choice of an activity to move up. */
export function SkillActivityView({ skillId, profileId, mode, addXp, triggerGain }: Props) {
  const skill = getSkillById(skillId);
  const levels = useSkillLevels(profileId);
  const level = levels[skillId] ?? null;
  const [activity, setActivity] = useState<SkillActivity | null>(null);
  const [round, setRound] = useState(0);
  const hasBank = hasQuestionBank(skillId);

  // Random draw happens in the click handler, never during render
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  if (!skill) return <p className="text-center text-slate-500">Compétence introuvable.</p>;

  function finishQuiz(correct: number, total: number) {
    if (level === null) setSkillLevel(profileId, skillId, 1);
    if (isQuizPassed(correct, total)) {
      advanceSkillLevel(profileId, skillId);
      persistSkillLevel(profileId, skillId);
      addXp(QUIZ_PASS_XP, 'quiz-perfect'); triggerGain(QUIZ_PASS_XP);
    }
  }
  function finishCards() { addXp(FLASHCARDS_XP, 'quiz-correct'); triggerGain(FLASHCARDS_XP); }
  function choose(next: SkillActivity) {
    setActivity(next);
    setQuestions(pickSkillQuestions(skillId, level ?? 1, QUIZ_LENGTH));
    setRound((r) => r + 1);
  }

  return (
    <div className="space-y-5">
      <header className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
        <p className="text-3xl">{skill.emoji}</p>
        <h1 className="mt-1 text-xl font-black text-[#1a1a2e]">{skill.name}</h1>
        <p className="mb-4 text-sm text-slate-500">{skill.description}</p>
        <SkillLevelMeter level={level} />
      </header>

      <div className="grid gap-2">
        {ACTIVITIES.map((a) => {
          const disabled = a.id !== 'evaluation' && !hasBank;
          return (
            <button key={a.id} disabled={disabled} onClick={() => choose(a.id)} aria-pressed={activity === a.id}
              className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left disabled:opacity-40 ${activity === a.id ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-white'}`}>
              <span className="text-2xl" aria-hidden>{a.emoji}</span>
              <span><span className="block font-bold text-[#1a1a2e]">{a.label}</span>
                <span className="text-xs text-slate-500">{disabled ? 'Bientôt disponible pour cette compétence' : a.hint}</span></span>
            </button>
          );
        })}
      </div>

      {activity === 'quiz' && questions.length > 0 && (
        <SkillQuiz key={round} questions={questions} mode={mode} onFinish={finishQuiz} onAnswered={(q, ok) => recordSkillAnswer(profileId, q, ok)} />
      )}
      {activity === 'flashcards' && questions.length > 0 && <Flashcards key={round} cards={toFlashcards(questions)} onFinish={finishCards}
        onCardSeen={(card, known) => { const q = questions.find((x) => x.id === card.id); if (q) recordSkillAnswer(profileId, q, known); }} />}
      {activity === 'evaluation' && <EvaluationPanel profileId={profileId} skillId={skillId} level={level} />}
    </div>
  );
}
