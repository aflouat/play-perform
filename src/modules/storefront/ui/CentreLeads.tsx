'use client';

import { useEffect, useState } from 'react';
import { fetchOrganizations } from '@/modules/organizations';
import { LEAD_STATUSES, LEAD_STATUS_LABEL, type LeadStatus } from '../domain/storefront';
import { fetchLeads, updateLeadStatus, type LeadView } from '../infra/storefront-client';

const when = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

/** The centre's commercial side: its public page to share, and the information requests to call back. */
export function CentreLeads() {
  const [leads, setLeads] = useState<LeadView[] | null>(null);
  const [pages, setPages] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    fetchLeads().then(setLeads);
    fetchOrganizations().then((orgs) => setPages(orgs.filter((o) => o.kind === 'center').map((o) => ({ name: o.name, slug: o.slug }))));
  }, []);

  async function change(lead: LeadView, status: LeadStatus) {
    if (await updateLeadStatus(lead.id, status)) setLeads((all) => (all ?? []).map((l) => (l.id === lead.id ? { ...l, status } : l)));
  }

  if (leads === null) return null;
  const waiting = leads.filter((l) => l.status === 'new').length;
  return (
    <section aria-label="Recrutement" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="font-black text-slate-800">📣 Recrutement {waiting > 0 && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{waiting} à rappeler</span>}</h2>
      {pages.map((p) => (
        <p key={p.slug} className="text-sm text-slate-600">
          Page publique de {p.name} : <a href={`/centres/${p.slug}`} target="_blank" rel="noreferrer" className="font-mono text-violet-700 underline">/centres/{p.slug}</a>
        </p>
      ))}
      {leads.length === 0
        ? <p className="text-sm text-slate-500">Aucune demande pour l’instant : partage ta page publique (réseaux sociaux, affiches, établissements scolaires).</p>
        : (
          <ul className="divide-y divide-slate-100">
            {leads.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                <span className="w-14 shrink-0 text-xs text-slate-400">{when(l.createdAt)}</span>
                <span className="min-w-0 flex-1">
                  <strong>{l.firstName}</strong> · <span className="font-mono text-xs">{l.contact}</span>
                  {l.pathId && <span className="text-xs text-slate-500"> · {l.pathId}</span>}
                  {l.message && <span className="block truncate text-xs text-slate-500">{l.message}</span>}
                </span>
                <select aria-label={`Suivi de la demande de ${l.firstName}`} value={l.status} onChange={(e) => change(l, e.target.value as LeadStatus)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs">
                  {LEAD_STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>)}
                </select>
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}
