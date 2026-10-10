import Link from 'next/link';
import type { TrainingPath } from '@/modules/dashboards';
import type { PublicCentre } from '../domain/storefront';
import { LeadForm } from './LeadForm';
import { PathsOffer } from './PathsOffer';

const STEPS = [
  { icon: '📱', title: 'Apprends en ligne, à ton rythme', text: 'Quiz, flashcards et ta carte au trésor : 4 phases, des chapitres clairs, un objectif par semaine.' },
  { icon: '🎤', title: 'Passe l’oral avec un examinateur', text: 'Réserve en ligne un créneau de 30 min : l’examinateur valide ton niveau, compétence par compétence.' },
  { icon: '🎓', title: 'Décroche ton diplôme', text: 'Chaque oral validé te fait monter d’un niveau, jusqu’à la maîtrise et au diplôme Play Perform.' },
];

/** Landing page of a franchised centre: its local identity, the network's method, its paths, and a call-back request. */
export function CentreLanding({ centre, paths, openSlots }: { centre: PublicCentre; paths: readonly TrainingPath[]; openSlots: number }) {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-14 px-4 pb-20 pt-10 sm:px-6">
      <section className="rounded-3xl bg-gradient-to-br from-violet-700 to-fuchsia-600 p-8 text-white shadow-lg sm:p-12">
        {centre.city && <p className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">📍 {centre.city}</p>}
        <h1 className="mt-3 text-3xl font-black sm:text-5xl">{centre.name}</h1>
        <p className="mt-3 max-w-2xl text-lg text-violet-100">
          Ton centre de formation du réseau Play Perform{centre.city ? ` à ${centre.city}` : ''} : apprends en ligne, valide à l’oral, obtiens ton diplôme.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#inscription" className="rounded-2xl bg-amber-400 px-6 py-3 font-black text-violet-950 shadow hover:bg-amber-300">Je veux m’inscrire →</a>
          <Link href="/apprenant" className="rounded-2xl bg-white/15 px-6 py-3 font-bold text-white hover:bg-white/25">J’ai déjà mon code d’accès</Link>
        </div>
      </section>

      <section aria-labelledby="methode" className="space-y-5">
        <h2 id="methode" className="text-2xl font-black text-[#1a1a2e]">Comment ça marche</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-3xl bg-white p-5 shadow-sm">
              <span aria-hidden="true" className="text-3xl">{s.icon}</span>
              <h3 className="mt-2 font-black text-[#1a1a2e]">{i + 1}. {s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
        {openSlots > 0 && (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            🗓️ {openSlots} créneau{openSlots > 1 ? 'x' : ''} d’oral disponible{openSlots > 1 ? 's' : ''} dans les 30 prochains jours.
          </p>
        )}
      </section>

      <section aria-labelledby="parcours" className="space-y-5">
        <h2 id="parcours" className="text-2xl font-black text-[#1a1a2e]">Les parcours proposés</h2>
        <PathsOffer paths={paths} />
      </section>

      <section id="inscription" aria-labelledby="inscription-titre" className="grid gap-8 rounded-3xl bg-violet-50 p-6 sm:p-10 md:grid-cols-[1fr_2fr]">
        <div className="space-y-2">
          <h2 id="inscription-titre" className="text-2xl font-black text-[#1a1a2e]">On t’accompagne pour t’inscrire</h2>
          <p className="text-sm text-slate-600">Laisse tes coordonnées : l’équipe de {centre.name} te rappelle, répond à tes questions et te donne ton code d’accès.</p>
          {centre.address && (
            <address className="pt-2 text-sm not-italic text-slate-700">
              <strong>{centre.name}</strong><br />{centre.address}<br />{[centre.postalCode, centre.city].filter(Boolean).join(' ')}
            </address>
          )}
        </div>
        <LeadForm slug={centre.slug} centreName={centre.name} paths={paths.map((p) => ({ id: p.id, name: p.name, emoji: p.emoji }))} />
      </section>

      <p className="text-center text-xs text-slate-500">Centre membre du réseau Play Perform : pédagogie, examens et diplômes gérés par le réseau.</p>
    </main>
  );
}
