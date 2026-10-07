import Link from 'next/link';
import type { AccessMode } from '../application/useLandingFlow';

interface Props {
  mode: AccessMode | null;
  onChoose: (mode: AccessMode) => void;
}

const CARD = 'w-full text-left rounded-2xl border-2 p-5 transition-all focus-visible:outline focus-visible:outline-4 focus-visible:outline-violet-300';

/** Step 1: try without an account, or sign in / sign up. */
export function ModeChoice({ mode, onChoose }: Props) {
  return (
    <div>
      <h2 id="flow-title" tabIndex={-1} className="text-2xl font-black text-slate-900 outline-none">Comment veux-tu commencer ?</h2>
      <p className="mt-1 text-slate-600 text-sm">Tu pourras toujours créer un compte plus tard.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onChoose('guest')} aria-pressed={mode === 'guest'}
          className={`${CARD} border-violet-200 bg-white hover:border-violet-500 hover:shadow-md`}>
          <span className="text-3xl" aria-hidden="true">🚀</span>
          <span className="mt-2 block text-lg font-black text-slate-900">Sans compte</span>
          <span className="mt-1 block text-sm text-slate-600">Commence tout de suite. Ton résultat reste sur cet appareil.</span>
          <span className="mt-3 inline-block text-sm font-bold text-violet-700">Continuer sans compte →</span>
        </button>

        <button type="button" onClick={() => onChoose('account')} aria-pressed={mode === 'account'}
          className={`${CARD} ${mode === 'account' ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-500 hover:shadow-md'}`}>
          <span className="text-3xl" aria-hidden="true">👤</span>
          <span className="mt-2 block text-lg font-black text-slate-900">Avec un compte</span>
          <span className="mt-1 block text-sm text-slate-600">Ta progression est sauvegardée partout et tes parents peuvent la suivre.</span>
          <span className="mt-3 inline-block text-sm font-bold text-violet-700">Se connecter ou s&apos;inscrire →</span>
        </button>
      </div>

      {mode === 'account' && (
        <div className="mt-4 rounded-2xl bg-violet-50 border border-violet-200 p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
          <Link href="/auth" className="rounded-xl bg-violet-600 px-5 py-3 text-center font-bold text-white hover:bg-violet-700">Se connecter</Link>
          <Link href="/auth?signup=1" className="rounded-xl bg-white border border-violet-300 px-5 py-3 text-center font-bold text-violet-700 hover:bg-violet-100">
            Créer un compte gratuit
          </Link>
          <button type="button" onClick={() => onChoose('guest')} className="text-sm font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900">
            ou essayer sans compte
          </button>
        </div>
      )}
    </div>
  );
}
