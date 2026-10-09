import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Connexion — Play Perform' };

/** Entry portal: two distinct doors. The learner's is large and bright, the centre's is smaller and sober. */
export default function PortalPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="text-center text-2xl font-black text-[#1a1a2e] sm:text-3xl">Bienvenue sur Play Perform</h1>
      <p className="mt-1 text-center text-slate-500">Choisis ta porte d&apos;entrée.</p>

      <div className="mt-8 grid items-start gap-5 sm:grid-cols-5">
        <section aria-labelledby="learner-title" className="rounded-3xl bg-gradient-to-br from-violet-700 to-fuchsia-600 p-7 text-white shadow-xl sm:col-span-3">
          <p className="text-5xl" aria-hidden="true">🚀</p>
          <h2 id="learner-title" className="mt-3 text-2xl font-black">Apprendre et progresser</h2>
          <p className="mt-2 text-violet-100">Découvre ton niveau, relève des défis et fais grandir ta ville compétence après compétence.</p>
          <Link href="/#commencer" className="mt-6 block rounded-2xl bg-amber-400 px-6 py-4 text-center text-lg font-black text-violet-950 shadow-lg hover:bg-amber-300">
            Je commence mon apprentissage →
          </Link>
          <Link href="/apprenant" className="mt-3 block text-center text-sm font-semibold text-white underline-offset-2 hover:underline">J&apos;ai déjà un code d&apos;accès</Link>
        </section>

        <section aria-labelledby="centre-title" className="rounded-xl border border-slate-300 bg-slate-100 p-5 sm:col-span-2">
          <p className="text-2xl" aria-hidden="true">🏫</p>
          <h2 id="centre-title" className="mt-2 text-base font-bold text-slate-800">Gérer mon centre</h2>
          <p className="mt-1 text-sm text-slate-600">Élèves, équipe, inscriptions et corrections.</p>
          <Link href="/auth" className="mt-4 block rounded-lg bg-slate-800 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-slate-700">Gérer mon centre de formation</Link>
          <Link href="/centre/inscription" className="mt-2 block text-center text-xs font-semibold text-slate-600 underline-offset-2 hover:underline">Créer l&apos;espace de mon centre</Link>
        </section>
      </div>
    </main>
  );
}
