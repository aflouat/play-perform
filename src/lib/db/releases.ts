import { getClient, getServerClient } from './client';

export interface DbReleaseNote {
  id?: string;
  version: string;
  deployed_at?: string;
  title: string;
  summary: string | null;
  changes: string[];
  tags: string[];
  deployed_by: string | null;
}

export interface ReleaseNoteFilter {
  q?: string;
  version?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export async function insertReleaseNote(note: Omit<DbReleaseNote, 'id' | 'deployed_at'>): Promise<void> {
  const db = getServerClient();
  await db.from('release_notes').insert({ ...note, deployed_at: new Date().toISOString() });
}

export async function fetchReleaseNotes(filter: ReleaseNoteFilter = {}): Promise<DbReleaseNote[]> {
  const db = getClient();
  if (!db) return [];
  let q = db.from('release_notes').select('*').order('deployed_at', { ascending: false });
  if (filter.version) q = q.eq('version', filter.version);
  if (filter.from) q = q.gte('deployed_at', filter.from);
  if (filter.to) q = q.lte('deployed_at', `${filter.to}T23:59:59Z`);
  if (filter.q) q = q.or(`title.ilike.%${filter.q}%,summary.ilike.%${filter.q}%`);
  if (filter.limit) q = q.limit(filter.limit);
  const { data } = await q;
  return (data as DbReleaseNote[]) ?? [];
}
