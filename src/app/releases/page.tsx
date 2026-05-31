import React from 'react';
import { ReleaseTable } from '@/components/shared/ReleaseTable';
import { STATIC_RELEASE_NOTES } from '@/lib/release-notes-static';
import type { DbReleaseNote } from '@/lib/db';

async function getReleaseNotes(): Promise<DbReleaseNote[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/releases`, { next: { revalidate: 60 } });
    if (!res.ok) return STATIC_RELEASE_NOTES;
    const data = await res.json() as { notes: DbReleaseNote[] };
    return data.notes.length > 0 ? data.notes : STATIC_RELEASE_NOTES;
  } catch {
    return STATIC_RELEASE_NOTES;
  }
}

export default async function ReleasesPage() {
  const notes = await getReleaseNotes();

  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1a1a2e] mb-1">Notes de version</h1>
          <p className="text-slate-500 text-sm">
            Historique de toutes les mises à jour de   Play Perform.
            Filtrez par date, numéro de version ou mots-clés.
          </p>
        </div>
        <ReleaseTable initial={notes} />
      </div>
    </main>
  );
}
