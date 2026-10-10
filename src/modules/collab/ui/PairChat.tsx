'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_NOTICE, MESSAGE_MAX } from '../domain/chat';
import { fetchChat, reportChatMessage, sendChatMessage, type ChatLine, type ChatView } from '../infra/chat-client';

const POLL_MS = 5000;
const time = (iso: string) => new Date(iso).toLocaleString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' });

/** Chat of the weekly pair, for their common project: open during the week, then archived (kept by Play Perform). */
export function PairChat() {
  const [view, setView] = useState<ChatView | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLLIElement>(null);

  const load = useCallback(() => { fetchChat().then((v) => { if (v) setView(v); }); }, []);
  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);
  useEffect(() => { bottom.current?.scrollIntoView?.({ block: 'nearest' }); }, [view?.messages.length]);

  if (!view?.thread) return null;
  const { thread, messages } = view;
  const open = thread.state === 'open';
  const partners = thread.members.filter((m) => !m.me).map((m) => m.nickname).join(' et ');

  async function send() {
    if (!thread || !draft.trim()) return;
    const failure = await sendChatMessage(thread.id, draft);
    setError(failure);
    if (!failure) { setDraft(''); load(); }
  }
  async function report(line: ChatLine) {
    if (window.confirm('Signaler ce message à Play Perform ? Il sera relu par l’équipe.') && (await reportChatMessage(line.id))) load();
  }

  return (
    <section aria-label="Chat du binôme" className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="font-black text-[#1a1a2e]">💬 Projet de la semaine avec {partners}</h2>
      <p className="text-xs text-slate-500">{CHAT_NOTICE}</p>
      <ul className="max-h-80 space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-3" aria-live="polite">
        {messages.length === 0 && <li className="text-center text-sm text-slate-400">Dites-vous bonjour et organisez votre projet !</li>}
        {messages.map((m) => (
          <li key={m.id} className={`flex flex-col ${m.mine ? 'items-end' : 'items-start'}`}>
            <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${m.mine ? 'bg-violet-600 text-white' : 'bg-white text-slate-800 shadow-sm'}`}>{m.body}</p>
            <span className="mt-0.5 text-[11px] text-slate-400">
              {m.mine ? 'Moi' : m.author} · {time(m.createdAt)}
              {!m.mine && (m.reported ? ' · signalé' : <button type="button" onClick={() => report(m)} className="ml-1 underline">Signaler</button>)}
            </span>
          </li>
        ))}
        <li ref={bottom} aria-hidden="true" />
      </ul>
      {open ? (
        <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={MESSAGE_MAX} aria-label="Message à ton binôme" placeholder="Écris à ton binôme…"
            className="min-w-0 flex-1 rounded-xl border-2 border-violet-100 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none" />
          <button type="submit" disabled={!draft.trim()} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Envoyer</button>
        </form>
      ) : <p role="status" className="text-sm font-semibold text-slate-500">Projet terminé : ce chat est archivé.</p>}
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    </section>
  );
}
