/** Public API of the skills module. Other modules must import from here only. */

export type { Skill, SkillLevelNumber, SkillLevelInfo } from './domain/skill';
export { SKILL_LEVELS, getSkillLevel } from './domain/skill';

export { getSkills, getSkillById } from './infra/skills-repository';

export { useSkillLevels, getAllSkillLevels, getSkillLevelFor, setSkillLevel, advanceSkillLevel } from './application/skill-progress';
export type { SkillActivity } from './domain/activity';
export { QUIZ_LENGTH, QUIZ_PASS_XP, FLASHCARDS_XP, isQuizPassed, nextLevelAfterQuiz } from './domain/activity';
export type { Flashcard } from './infra/skill-content';
export { getSkillSubject, hasQuestionBank, difficultyForLevel, pickSkillQuestions, toFlashcards } from './infra/skill-content';
export { SkillsDashboard } from './ui/SkillsDashboard';
export { SkillActivityView } from './ui/SkillActivityView';
export { SkillLevelMeter } from './ui/SkillLevelMeter';
export type { SkillEvaluation, EvaluationStatus, EvaluationSubmission, EvaluationCorrection, Validation } from './domain/evaluation';
export { ANSWER_MIN, ANSWER_MAX, validateCorrection, levelAfterEvaluations } from './domain/evaluation';
export { getEvaluationPrompt } from './infra/evaluation-prompts';
export { validateSubmission, validateLevelUpdate } from './application/validate-submission';
export type { SkillLevels, LevelUpdate } from './domain/skill-levels';
export { mergeLevels, applyPlacements } from './domain/skill-levels';
export { fetchPendingEvaluations, sendCorrection } from './infra/evaluation-client';
export { EvaluationPanel } from './ui/EvaluationPanel';
export { syncSkillLevels, persistSkillLevel } from './application/skill-sync';
