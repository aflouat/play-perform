/** Server-only API of the dashboards module (used by API routes). */
export { loadCentreInput, loadExaminerRows } from './infra/dashboard-repository';
export type { CentreScope } from './infra/dashboard-repository';
export { readTrainingPath, writeTrainingPath } from './infra/training-path-repository';
export { listTrainingPaths, choosablePathIds, offeredPaths, insertTrainingPath, updateTrainingPath } from './infra/training-path-catalog-repository';
