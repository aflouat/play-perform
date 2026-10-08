import type { SkillActivity } from './activity';
import { SKILL_LEVELS, type Skill, type SkillLevelInfo } from './skill';

/** Time budget used for planning: minutes of work to climb one level. */
export const MINUTES_PER_LEVEL = 120;

export interface CourseSheet {
  skill: Skill;
  levels: readonly SkillLevelInfo[];
  activities: SkillActivity[];
  /** From level 1 to mastery (level 5) */
  minutesToMaster: number;
}

/** What a learner reads before asking to join a course. */
export function buildCourseSheet(skill: Skill, hasQuestionBank: boolean): CourseSheet {
  return {
    skill,
    levels: SKILL_LEVELS,
    activities: hasQuestionBank ? ['quiz', 'flashcards', 'evaluation'] : ['evaluation'],
    minutesToMaster: MINUTES_PER_LEVEL * (SKILL_LEVELS.length - 1),
  };
}
