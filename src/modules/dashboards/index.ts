/** Public API of the dashboards module: the centre's, the examiner's and the learner's home. */
export type { ActivityStatus, StudentRow, StudentLine, CentreInput, CentreDashboard } from './domain/centre';
export { activityStatus, buildCentreDashboard, ACTIVE_DAYS, IDLE_DAYS } from './domain/centre';
export type { EvaluationRow, ExaminerDashboard } from './domain/examiner';
export { buildExaminerDashboard } from './domain/examiner';
export type { LearnerSnapshot, NextAction } from './domain/learner';
export { nextActionsFor } from './domain/learner';
export { useLearnerSnapshot } from './application/useLearnerSnapshot';
export { LearnerHome } from './ui/LearnerHome';
export { CentreDashboardView } from './ui/CentreDashboardView';
export { ExaminerDashboardView } from './ui/ExaminerDashboardView';
