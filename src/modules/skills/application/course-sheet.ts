import { buildCourseSheet, type CourseSheet } from '../domain/course-sheet';
import { hasQuestionBank } from '../infra/skill-content';
import { getSkillById } from '../infra/skills-repository';

export function getCourseSheet(skillId: string): CourseSheet | undefined {
  const skill = getSkillById(skillId);
  return skill ? buildCourseSheet(skill, hasQuestionBank(skillId)) : undefined;
}
