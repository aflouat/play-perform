import Link from 'next/link';

/** The centres' own corner (B2B): sober, away from the learner's calls to action. */
export function TeachersSection() {
  return (
    <section aria-labelledby="centres-title" className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-2xl border border-slate-300 bg-slate-800 p-5 text-slate-100 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pour les centres de formation</p>
        <h2 id="centres-title" className="mt-1 text-lg font-bold sm:text-xl">Inscrivez vos élèves et suivez leurs progrès</h2>
        <p className="mt-2 text-sm text-slate-300">
          Votre centre (SIREN, établissement, adresse) inscrit ses élèves, leur remet un code d&apos;accès,
          valide les inscriptions aux cours et recrute enseignants et examinateurs.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link href="/centre/inscription" className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-bold text-slate-900 hover:bg-slate-200">Créer l’espace de mon centre</Link>
          <Link href="/auth" className="rounded-lg border border-slate-500 px-4 py-2.5 text-center text-sm font-semibold hover:bg-slate-700">Gérer mon centre de formation</Link>
        </div>
      </div>
    </section>
  );
}
