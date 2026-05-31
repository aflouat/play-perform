'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { DbReleaseNote } from '@/lib/db';

interface ReleaseTableProps {
  initial: DbReleaseNote[];
}

export function ReleaseTable({ initial }: ReleaseTableProps) {
  const [notes, setNotes] = useState<DbReleaseNote[]>(initial);
  const [q, setQ] = useState('');
  const [version, setVersion] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (version) params.set('version', version);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    try {
      const res = await fetch(`/api/releases?${params}`);
      const data = await res.json() as { notes: DbReleaseNote[] };
      setNotes(data.notes);
    } finally {
      setLoading(false);
    }
  }, [q, version, from, to]);

  useEffect(() => {
    const t = setTimeout(search, 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Recherche texte…"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
        <input value={version} onChange={(e) => setVersion(e.target.value)}
          placeholder="Version (ex: 0.2.0)"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
      </div>

      {loading && <p className="text-sm text-slate-400 animate-pulse">Chargement…</p>}

      {notes.length === 0 && !loading && (
        <p className="text-slate-500 text-sm">Aucune release ne correspond à ces critères.</p>
      )}

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id ?? note.version} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="font-mono text-sm font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg">
                v{note.version}
              </span>
              <span className="text-xs text-slate-400">
                {note.deployed_at ? new Date(note.deployed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
              </span>
              {(note.tags ?? []).map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
            <h3 className="font-bold text-[#1a1a2e] text-base mb-1">{note.title}</h3>
            {note.summary && <p className="text-sm text-slate-500 mb-3">{note.summary}</p>}
            <ul className="space-y-1">
              {note.changes.map((c, i) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2">
                  <span className="text-violet-400 shrink-0">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
