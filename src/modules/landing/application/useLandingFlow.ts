'use client';

import { useState, useCallback } from 'react';
import { getSkillById, type Skill } from '@/modules/skills';
import {
  getPlacementTest, scoreAnswer, estimateStartLevel,
  type PlacementAnswer, type PlacementQuestion, type PlacementResult,
} from '@/modules/quizzes';

export type LandingStep = 'mode' | 'skill' | 'test' | 'result';
/** guest = no account, progress kept on this device · account = sign in / sign up */
export type AccessMode = 'guest' | 'account';

interface Options {
  onResult?: (skillId: string, result: PlacementResult) => void;
}

/** Visitor journey on the home page: access mode → skill → placement test → result. */
export function useLandingFlow({ onResult }: Options = {}) {
  const [step, setStep] = useState<LandingStep>('mode');
  const [mode, setMode] = useState<AccessMode | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [answers, setAnswers] = useState<PlacementAnswer[]>([]);
  const [result, setResult] = useState<PlacementResult | null>(null);

  const chooseMode = useCallback((next: AccessMode) => {
    setMode(next);
    setStep(next === 'guest' ? 'skill' : 'mode');
  }, []);

  const chooseSkill = useCallback((skillId: string) => {
    const found = getSkillById(skillId);
    const test = getPlacementTest(skillId);
    if (!found || test.length === 0) return;
    setSkill(found); setQuestions(test); setAnswers([]); setResult(null);
    setStep('test');
  }, []);

  const answer = useCallback((chosenIndex: number | null) => {
    const question = questions[answers.length];
    if (!question || !skill) return;
    const next = [...answers, scoreAnswer(question, chosenIndex)];
    setAnswers(next);
    if (next.length === questions.length) {
      const computed = estimateStartLevel(next);
      setResult(computed);
      setStep('result');
      onResult?.(skill.id, computed);
    }
  }, [questions, answers, skill, onResult]);

  const chooseAnotherSkill = useCallback(() => {
    setSkill(null); setQuestions([]); setAnswers([]); setResult(null);
    setStep('skill');
  }, []);

  const changeMode = useCallback(() => {
    setMode(null); setStep('mode');
  }, []);

  return {
    step, mode, skill, questions, result,
    questionIndex: answers.length,
    question: questions[answers.length] ?? null,
    chooseMode, chooseSkill, answer, chooseAnotherSkill, changeMode,
  };
}
