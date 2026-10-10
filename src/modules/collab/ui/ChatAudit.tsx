'use client';

import { useEffect, useState } from 'react';
import { fetchAuditThreads, fetchAuditTranscript, type AuditPerson, type AuditThread, type AuditTranscript } from '../infra/audit-client';

const who = (p: Omit<AuditPerson, 'id'>) => `${p.name}${p.nickname ? ` (« ${p.nickname} »)` : ''}`;
const when = (iso: string) => new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

/** Parent company: every pair chat (open or archived) as an audit trail, reported ones first if asked; full transcript with real names. */
export function ChatAudit() {
  const [reportedOnly, setReportedOnly] = useState(true);
  const [threads, setThreads] = useState<AuditThread[] | null>(null);
  const [transcript, setTranscript] = useState<AuditTranscript | null>(null);
  useEffect(() => { fetchAuditThreads(reportedOnly).then(setThreads); }, [reportedOnly]);

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={reportedOnly} onChange={(e) => setReportedOnly(e.target.checked)} /> Seulement les chats avec un message signalé
      </label>
      {threads === null && <p className="text-sm text-slate-400">Chargement…</p>}
      {threads?.length === 0 && <p className="text-sm text-slate-500">Aucun chat {reportedOnly ? 'signalé' : ''} pour l’instant.</p>}
      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {threads?.map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => fetchAuditTranscript(t.id).then(setTranscript)} className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50">
              <span className="font-mono text-xs text-slate-500">{t.project}</span>
              <span className="flex-1">{t.members.map(who).join(' · ')}</span>
              <span className="text-xs text-slate-500">{t.messageCount} message{t.messageCount > 1 ? 's' : ''} · {t.state === 'open' ? 'en cours' : 'archivé'}</span>
              {t.reportCount > 0 && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">{t.reportCount} signalé{t.reportCount > 1 ? 's' : ''}</span>}
            </button>
          </li>
        ))}
      </ul>
      {transcript && (
        <section aria-label="Transcription" className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-black text-slate-800">Projet {transcript.thread.project} — {transcript.thread.members.map(who).join(' · ')}</h2>
          <ol className="space-y-1 text-sm">
            {transcript.messages.map((m) => (
              <li key={m.id} className={m.reportedAt ? 'rounded bg-rose-50 px-2 py-1' : 'px-2 py-1'}>
                <span className="text-xs text-slate-400">{when(m.createdAt)}</span> <strong>{who(m.author)}</strong> : {m.body}
                {m.reportedAt && <span className="ml-2 text-xs font-bold text-rose-700">signalé le {when(m.reportedAt)}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
