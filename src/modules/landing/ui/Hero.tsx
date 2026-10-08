import Link from 'next/link';

const PROMISES = [
  { icon: '⏱️', text: 'Test de niveau en 2 minutes' },
  { icon: '🎯', text: '5 niveaux par compétence' },
  { icon: '🔓', text: 'Sans inscription obligatoire' },
];

/** Hero: one-sentence promise + main call to action. */
export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 text-white">
      <div aria-hidden="true" className="absolute inset-0 opacity-20 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative mx-auto max-w-3xl px-4 pt-14 pb-16 sm:pt-20 sm:pb-24 text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide uppercase">
          ✨ Play Perform · Centre de formation pour tous
        </p>
        <h1 className="mt-5 text-3xl sm:text-5xl font-black leading-tight tracking-tight">
          Progresse à ton rythme,<br className="hidden sm:block" /> compétence par compétence.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-violet-100 max-w-xl mx-auto">
          Choisis une compétence, découvre ton niveau de départ avec un test rapide,
          puis avance sur un parcours en 5 niveaux. Pour les collégiens et lycéens.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={onStart}
            className="rounded-2xl bg-amber-400 px-7 py-4 text-base font-black text-violet-950 shadow-lg hover:bg-amber-300 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white transition-colors">
            Faire mon test de niveau →
          </button>
          <Link href="/auth"
            className="rounded-2xl bg-white/10 border border-white/30 px-7 py-4 text-base font-bold hover:bg-white/20 transition-colors">
            J&apos;ai déjà un compte
          </Link>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-violet-100">
          {PROMISES.map((p) => (
            <li key={p.text} className="flex items-center gap-2"><span aria-hidden="true">{p.icon}</span>{p.text}</li>
          ))}
        </ul>
      </div>
    </header>
  );
}
