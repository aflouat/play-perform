/** Public API of the skills module. Other modules must import from here only. */

export type { Skill, SkillLevelNumber, SkillLevelInfo } from './domain/skill';
export { SKILL_LEVELS, getSkillLevel } from './domain/skill';

export { getSkills, getSkillById } from './infra/skills-repository';

export { useSkillLevels, getAllSkillLevels, getSkillLevelFor, setSkillLevel, advanceSkillLevel } from './application/skill-progress';
export type { SkillActivity } from './domain/activity';
export { QUIZ_LENGTH, QUIZ_PASS_XP, FLASHCARDS_XP, isQuizPassed, nextLevelAfterQuiz } from './domain/activity';
export type { Flashcard } from './infra/skill-content';
export { getSkillSubject, difficultyForLevel, pickSkillQuestions, toFlashcards } from './infra/skill-content';
export { SkillsDashboard } from './ui/SkillsDashboard';
export { SkillActivityView } from './ui/SkillActivityView';
export { SkillLevelMeter } from './ui/SkillLevelMeter';
