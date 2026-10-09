import Link from 'next/link';
import type { Metadata } from 'next';
import { CentreSignupForm } from '@/modules/organizations/ui/CentreSignupForm';

export const metadata: Metadata = { title: 'Créer l’espace de mon centre — Play Perform' };

export default function CentreSignupPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <Link href="/connexion" className="mb-6 inline-flex text-sm text-slate-400 hover:text-slate-600">← Retour</Link>
      <h1 className="text-2xl font-black text-[#1a1a2e]">Créer l’espace de mon centre</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">
        Un centre de formation est une personne morale : indiquez sa raison sociale, son SIREN, l’établissement (SIRET) et son adresse.
        Play Perform vérifie le dossier avant d’ouvrir l’espace. Vous inscrirez ensuite vos élèves, recruterez enseignants et examinateurs.
      </p>
      <CentreSignupForm />
    </main>
  );
}
