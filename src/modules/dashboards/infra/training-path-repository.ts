import { getServerClient } from '@/lib/db/client';

/** Server-side only (service role): the training path stored on the student. */
export async function readTrainingPath(profileId: string): Promise<string | null> {
  const { data, error } = await getServerClient().from('students').select('training_path').eq('id', profileId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { training_path: string | null } | null)?.training_path ?? null;
}

export async function writeTrainingPath(profileId: string, pathId: string | null): Promise<void> {
  const { error } = await getServerClient().from('students').update({ training_path: pathId }).eq('id', profileId);
  if (error) throw new Error(error.message);
}
