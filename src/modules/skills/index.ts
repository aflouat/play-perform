/** Public API of the skills module. Other modules must import from here only. */

export type { Skill, SkillLevelNumber, SkillLevelInfo } from './domain/skill';
export { SKILL_LEVELS, getSkillLevel } from './domain/skill';

export { getSkills, getSkillById } from './infra/skills-repository';

export { useSkillLevels, getAllSkillLevels, getSkillLevelFor, setSkillLevel, advanceSkillLevel } from './application/skill-progress';
export type { SkillActivity } from './domain/activity';
export { QUIZ_LENGTH, QUIZ_PASS_XP, FLASHCARDS_XP, isQuizPassed, nextLevelAfterQuiz } from './domain/activity';
export type { Flashcard } from './infra/skill-content';
export { getSkillSubject, hasQuestionBank, getSkillBank, difficultyForLevel, pickSkillQuestions, toFlashcards } from './infra/skill-content';
export { SkillMap } from './ui/SkillMap';
export { SkillActivityView } from './ui/SkillActivityView';
export { SkillLevelMeter } from './ui/SkillLevelMeter';
export type { SkillEvaluation, EvaluationStatus, EvaluationSubmission, EvaluationCorrection, Validation } from './domain/evaluation';
export { ANSWER_MIN, ANSWER_MAX, validateCorrection, levelAfterEvaluations } from './domain/evaluation';
export { getEvaluationPrompt } from './infra/evaluation-prompts';
export { validateSubmission, validateLevelUpdate, validateEnrollmentRequest } from './application/validate-submission';
export type { SkillLevels, LevelUpdate } from './domain/skill-levels';
export { mergeLevels, applyPlacements } from './domain/skill-levels';
export { fetchPendingEvaluations, sendCorrection } from './infra/evaluation-client';
export { EvaluationPanel } from './ui/EvaluationPanel';
export { syncSkillLevels, persistSkillLevel } from './application/skill-sync';
export type { Building, ReviewSummary, Pace } from './domain/dashboard';
export { masteryPercent, buildingFor, summarizeReviews, paceToGoal } from './domain/dashboard';
export { getSkillPlan, setSkillPlan, getAllPlans } from './application/skill-plans';
export { sendDueReminders, reminderPermission, requestReminderPermission } from './application/reminders';
export { ReminderRunner } from './ui/ReminderRunner';
export { recordSkillAnswer, loadSkillReviews } from './infra/skill-reviews';
export type { SkillEnrollment, EnrollmentStatus, EnrollmentRequest, EnrollmentDecision } from './domain/enrollment';
export { MOTIVATION_MIN, MOTIVATION_MAX, validateEnrollmentDecision, isEnrolled } from './domain/enrollment';
export type { CourseSheet } from './domain/course-sheet';
export { MINUTES_PER_LEVEL } from './domain/course-sheet';
export { getCourseSheet } from './application/course-sheet';
export { fetchPendingEnrollments, sendEnrollmentDecision } from './infra/enrollment-client';
export { CourseSheetView } from './ui/CourseSheetView';
export { useEnrollments } from './application/use-enrollments';
export type { StudyPlan } from './domain/effort';
export { EMPTY_PLAN, toDay, remainingMinutes, dailyMinutesNeeded, victoryDate, isReminderDue, reminderMessage } from './domain/effort';
export type { ScheduledReminder, DueReminder } from './domain/push-schedule';
export { zonedNow, dueScheduledReminders } from './domain/push-schedule';
export { enablePush, disablePush, syncPushReminders, isPushActive, pushSupported } from './application/push';
