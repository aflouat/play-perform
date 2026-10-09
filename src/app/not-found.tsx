import Link from 'next/link';

/** French 404 page, rendered between the site header and footer. */
export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-5xl" aria-hidden="true">🧭</p>
      <h1 className="mt-4 text-2xl font-black text-slate-900">Page introuvable</h1>
      <p className="mt-2 max-w-sm text-slate-600">Le lien est peut-être ancien ou mal recopié. Reviens à l&apos;accueil pour reprendre ton parcours.</p>
      <Link href="/" className="mt-6 rounded-2xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700">Retour à l&apos;accueil</Link>
    </div>
  );
}
