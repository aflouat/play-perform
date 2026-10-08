import Link from 'next/link';

/** Short section for teachers. */
export function TeachersSection({ onTryTest }: { onTryTest: () => void }) {
  return (
    <section aria-labelledby="teachers-title" className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8">
          <h2 id="teachers-title" className="text-xl sm:text-2xl font-black">🧑‍🏫 Vous êtes enseignant ?</h2>
          <p className="mt-2 text-slate-300">
            Créez un espace enseignant pour ajouter vos élèves, leur donner un accès apprenant
            et suivre leur progression compétence par compétence, du primaire au lycée.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Link href="/auth?signup=1" className="rounded-xl bg-amber-400 px-5 py-3 text-center font-black text-slate-900 hover:bg-amber-300">
              Créer un espace enseignant
            </Link>
            <button type="button" onClick={onTryTest}
              className="rounded-xl border border-white/30 px-5 py-3 font-bold hover:bg-white/10">
              Voir le test de niveau
            </button>
          </div>
        </div>
      </section>
  );
}
