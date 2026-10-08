import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confidentialité — Play & Perform',
  description: 'Quelles données Play & Perform conserve, pourquoi et comment les faire effacer.',
};

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 pb-20 pt-10">
      <Link href="/" className="mb-8 inline-flex text-sm text-slate-400 hover:text-slate-600">← Retour</Link>
      <h1 className="mb-2 text-3xl font-black tracking-tight text-[#1a1a2e]">Confidentialité</h1>
      <p className="mb-8 text-slate-500">Play &amp; Perform est fait pour des jeunes : nous gardons le strict nécessaire.</p>

      <Block title="Qui crée le compte ?">
        <p>Le compte est ouvert par un enseignant, un tuteur ou un adulte responsable, avec son adresse e-mail. Il crée ensuite les profils des apprenants et leur donne un accès (prénom, âge, classe). Aucun nom de famille n&apos;est demandé.</p>
      </Block>
      <Block title="Quelles données sont conservées ?">
        <ul className="list-disc space-y-1 pl-5">
          <li>Adulte : adresse e-mail et mot de passe (chiffré par le service d&apos;authentification).</li>
          <li>Jeune : prénom, âge, classe, avatar, XP, série de jours, niveaux par compétence.</li>
          <li>Accès apprenant : un code à 8 caractères, régénérable par l&apos;enseignant.</li>
          <li>Cours : les demandes d&apos;inscription (motivations) et les réponses du centre de formation.</li>
          <li>Évaluations : les réponses rédigées, lues par un examinateur, avec son commentaire.</li>
          <li>Sur l&apos;appareil (localStorage) : progression, planning de révisions, plans de travail et heures de rappel, résultats du test de niveau fait sans compte. Les rappels sont des notifications du navigateur, que tu peux refuser ou retirer à tout moment.</li>
        </ul>
      </Block>
      <Block title="Ce que nous ne faisons pas">
        <p>Pas de publicité, pas de revente de données, pas de traceurs publicitaires. Les données servent uniquement à faire fonctionner l&apos;apprentissage et le suivi par l&apos;enseignant.</p>
      </Block>
      <Block title="Où sont-elles hébergées ?">
        <p>Le site est servi par Vercel ; la base de données et l&apos;authentification sont fournies par Supabase. Les e-mails d&apos;inscription transitent par un service d&apos;envoi (Brevo).</p>
      </Block>
      <Block title="Accéder, corriger, effacer">
        <p>L&apos;enseignant peut modifier ou supprimer chaque profil depuis l&apos;espace enseignant. Pour supprimer le compte entier ou obtenir une copie des données, écris-nous{CONTACT ? <> à <a className="text-violet-600 underline" href={`mailto:${CONTACT}`}>{CONTACT}</a></> : ' via la page FAQ'}.</p>
      </Block>
    </main>
  );
}
