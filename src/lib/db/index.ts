// Barrel re-export — all imports of '@/lib/db' continue to work unchanged
export { getClient, getServerClient } from './client';
export type { DbScore, DbBadge, DbQuizAnswer, DbKeyboardProgress } from './scores';
export { syncScoreToDb, fetchScoreFromDb, syncBadgeToDb, logQuizAnswer, logKeyboardSession } from './scores';
export type { DbQuestion } from './questions';
export { insertQuestions, fetchQuestionsFromDb, fetchAllQuestionsFromDb, updateQuestion, deleteQuestion } from './questions';
export type { DbStudent } from './students';
export { fetchStudents, insertStudent, deleteStudent, updateStudent } from './students';
export type { DbReleaseNote, ReleaseNoteFilter } from './releases';
export { insertReleaseNote, fetchReleaseNotes } from './releases';
