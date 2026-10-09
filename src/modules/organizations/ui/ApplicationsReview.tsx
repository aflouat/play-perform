'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatSiren, formatSiret } from '../domain/identity';
import type { CentreApplication } from '../domain/application';
import { decideCentreApplication, fetchPendingApplications } from '../infra/organization-client';

function ApplicationCard({ item, onDecided }: { item: CentreApplication; onDecided: () => void }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function decide(status: 'approved' | 'rejected') {
    setError(null);
    const failure = await decideCentreApplication(item.id, status, comment);
    if (failure) setError(failure); else onDecided();
  }
  return (
    <li className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
      <p className="font-black text-[#1a1a2e]">🏫 {item.legalName}</p>
      <p className="text-slate-600">SIREN {formatSiren(item.siren)} · SIRET {formatSiret(item.siret)}<br />{item.address}, {item.postalCode} {item.city}<br />Responsable : {item.email}</p>
      <p className="text-xs text-slate-400">Vérifie l’existence de l’établissement (annuaire des entreprises) avant d’accepter.</p>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} aria-label="Commentaire" placeholder="Message au demandeur (obligatoire pour refuser)" className="w-full rounded-xl border border-slate-300 p-2" />
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      <div className="flex gap-2">
        <button onClick={() => decide('rejected')} className="flex-1 rounded-xl bg-amber-100 py-2 font-bold text-amber-800">↩️ Refuser</button>
        <button onClick={() => decide('approved')} className="flex-1 rounded-xl bg-emerald-500 py-2 font-bold text-white">✅ Ouvrir le centre</button>
      </div>
    </li>
  );
}

/** Super admin: applications of new centres waiting for a decision. */
export function ApplicationsReview({ onChanged }: { onChanged: () => void }) {
  const [items, setItems] = useState<CentreApplication[]>([]);
  const load = useCallback(() => { fetchPendingApplications().then(setItems); }, []);
  useEffect(load, [load]);
  if (items.length === 0) return null;
  return (
    <section aria-label="Dossiers de centres" className="space-y-3">
      <h2 className="font-black text-[#1a1a2e]">Dossiers de centres en attente ({items.length})</h2>
      <ul className="space-y-3">{items.map((i) => <ApplicationCard key={i.id} item={i} onDecided={() => { load(); onChanged(); }} />)}</ul>
    </section>
  );
}
