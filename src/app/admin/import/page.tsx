'use client';

import React, { useState } from 'react';
import { ImportDropzone } from '@/components/admin/ImportDropzone';
import type { RowError } from '@/lib/csv-parser';

interface ImportResult {
  imported: number;
  errors: RowError[];
}

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setFatalError(null);

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const res = await fetch('/api/questions/import', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        setFatalError(body.error ?? 'Erreur serveur');
      } else {
        setResult(await res.json() as ImportResult);
      }
    } catch {
      setFatalError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Import de questions</h1>
      <p className="text-slate-500 mb-6 text-sm">
        Importe des questions depuis un fichier CSV. Voir le format dans la documentation.
      </p>

      <ImportDropzone onFile={setFile} disabled={loading} />

      {file && (
        <p className="mt-3 text-sm text-slate-500">
          Fichier sélectionné : <span className="font-medium text-slate-700">{file.name}</span>
        </p>
      )}

      <button
        onClick={handleImport}
        disabled={!file || loading}
        className="mt-4 w-full py-3 rounded-2xl bg-violet-600 text-white font-bold text-base disabled:opacity-40 hover:bg-violet-700 transition-colors"
      >
        {loading ? 'Import en cours…' : 'Importer'}
      </button>

      {fatalError && (
        <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-rose-700 text-sm">
          {fatalError}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <span className="font-bold text-emerald-700">{result.imported} question(s) importée(s) avec succès.</span>
            {result.errors.length > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                {result.errors.length} erreur(s).
              </span>
            )}
          </div>

          {result.errors.length > 0 && (
            <div className="overflow-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-2 text-left">Ligne</th>
                    <th className="px-4 py-2 text-left">Colonne</th>
                    <th className="px-4 py-2 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((e, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-mono">{e.row}</td>
                      <td className="px-4 py-2 font-mono text-violet-600">{e.column}</td>
                      <td className="px-4 py-2 text-slate-700">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
