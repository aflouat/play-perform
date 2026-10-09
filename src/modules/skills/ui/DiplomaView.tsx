import type { DiplomaData } from '../infra/diploma-client';

const formatDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** The printable diploma (A4 landscape when printed). Real names appear here and nowhere else. */
export function DiplomaView({ diploma }: { diploma: DiplomaData }) {
  return (
    <article aria-label="Diplôme" className="mx-auto aspect-[1.414/1] w-full max-w-3xl rounded-lg border-[10px] border-double border-amber-500 bg-amber-50 p-6 text-center shadow-lg sm:p-10 print:max-w-none print:rounded-none print:shadow-none">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700">Play Perform{diploma.centreName ? ` · ${diploma.centreName}` : ''}</p>
      <h1 className="mt-3 font-serif text-3xl font-black text-[#1a1a2e] sm:text-5xl">Diplôme</h1>
      <p className="mt-4 text-sm text-slate-600">décerné à</p>
      <p className="mt-1 font-serif text-2xl font-bold text-violet-800 sm:text-4xl">{diploma.firstName} {diploma.lastName}</p>
      <p className="mx-auto mt-5 max-w-xl text-sm text-slate-700 sm:text-base">
        pour avoir suivi la formation complète <strong>{diploma.skillEmoji} {diploma.skillName}</strong> et validé le niveau 5 · {diploma.levelLabel}.
      </p>
      <div className="mt-8 flex items-end justify-between text-xs text-slate-600">
        <p>Délivré le {formatDate(diploma.issuedOn)}</p>
        <p className="font-mono">Réf. {diploma.reference}</p>
      </div>
    </article>
  );
}
