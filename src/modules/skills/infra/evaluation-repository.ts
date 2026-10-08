import { getServerClient } from '@/lib/db/client';
import type { EvaluationCorrection, EvaluationStatus, EvaluationSubmission, SkillEvaluation } from '../domain/evaluation';
import type { SkillLevelNumber } from '../domain/skill';
import { raiseLevel } from './levels-repository';

interface Row {
  id: string; profile_id: string; skill_id: string; level: number; prompt: string; answer: string;
  status: EvaluationStatus; examiner_comment: string | null; created_at: string; corrected_at: string | null;
}

/** An evaluation waiting for an examiner, with the learner's name. */
export interface PendingEvaluation extends SkillEvaluation { studentName: string }

const toEvaluation = (r: Row): SkillEvaluation => ({
  id: r.id, profileId: r.profile_id, skillId: r.skill_id, level: r.level as SkillLevelNumber, prompt: r.prompt,
  answer: r.answer, status: r.status, examinerComment: r.examiner_comment, createdAt: r.created_at, correctedAt: r.corrected_at,
});

const table = () => getServerClient().from('skill_evaluations');

/** Server-side only (service role). */
export async function isStudentOfParent(parentId: string, profileId: string): Promise<boolean> {
  const { data } = await getServerClient().from('students').select('id').eq('id', profileId).eq('parent_id', parentId).maybeSingle();
  return data !== null;
}

export async function listEvaluationsForProfile(profileId: string): Promise<SkillEvaluation[]> {
  const { data, error } = await table().select('*').eq('profile_id', profileId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toEvaluation);
}

export async function listPendingEvaluations(): Promise<PendingEvaluation[]> {
  const { data, error } = await table().select('*').eq('status', 'pending').order('created_at');
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];
  const { data: students } = await getServerClient().from('students').select('id, name').in('id', rows.map((r) => r.profile_id));
  const names = new Map(((students ?? []) as { id: string; name: string }[]).map((s) => [s.id, s.name]));
  return rows.map((r) => ({ ...toEvaluation(r), studentName: names.get(r.profile_id) ?? 'Élève' }));
}

/** Returns null when an evaluation of this skill and level is already waiting for correction. */
export async function createEvaluation(submission: EvaluationSubmission, prompt: string): Promise<SkillEvaluation | null> {
  const { data: waiting } = await table().select('id').eq('profile_id', submission.profileId)
    .eq('skill_id', submission.skillId).eq('level', submission.level).eq('status', 'pending').limit(1);
  if ((waiting ?? []).length > 0) return null;
  const { data, error } = await table().insert({
    profile_id: submission.profileId, skill_id: submission.skillId, level: submission.level, prompt, answer: submission.answer,
  }).select().single();
  if (error) throw new Error(error.message);
  return toEvaluation(data as Row);
}

export async function correctEvaluation(id: string, correction: EvaluationCorrection): Promise<SkillEvaluation | null> {
  const { data, error } = await table()
    .update({ status: correction.status, examiner_comment: correction.comment || null, corrected_at: new Date().toISOString() })
    .eq('id', id).eq('status', 'pending').select().maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const evaluation = toEvaluation(data as Row);
  // A validated evaluation raises the persisted level right away (the learner's device catches up on next visit)
  if (evaluation.status === 'passed') await raiseLevel(evaluation.profileId, evaluation.skillId, Math.min(5, evaluation.level + 1) as SkillLevelNumber);
  return evaluation;
}
