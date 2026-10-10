import type { VerificationStatus } from '../domain/certificate';

export interface VerifiedCertificate { holder: string; skillName: string; levelLabel: string; centreName: string | null; issuedOn: string; reference: string }

const STATUS = {
  valid: { icon: '✅', title: 'Certificat authentique', text: 'Ce certificat figure dans le registre Play Perform et n’a pas été modifié.', style: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
  revoked: { icon: '⛔', title: 'Certificat révoqué', text: 'Play Perform a révoqué ce certificat : il n’est plus valable.', style: 'border-rose-300 bg-rose-50 text-rose-900' },
  forged: { icon: '⚠️', title: 'Document non conforme', text: 'Le QR code ne correspond pas au certificat enregistré : ce document a pu être modifié.', style: 'border-rose-300 bg-rose-50 text-rose-900' },
  unknown: { icon: '❓', title: 'Référence inconnue', text: 'Aucun certificat Play Perform ne porte cette référence. Vérifie la saisie (format PP-XXXXXXXX).', style: 'border-slate-300 bg-slate-50 text-slate-800' },
} as const;

const day = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Public answer of the registry: status, then what the certificate attests (holder shown as first name and initial). */
export function VerificationView({ status, certificate, reference }: { status: VerificationStatus; certificate: VerifiedCertificate | null; reference: string }) {
  const s = STATUS[status];
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-12">
      <p className="text-center text-sm font-black tracking-widest text-violet-700">PLAY PERFORM · VÉRIFICATION DE CERTIFICAT</p>
      <section role="status" className={`rounded-3xl border-2 p-6 ${s.style}`}>
        <h1 className="text-2xl font-black"><span aria-hidden="true">{s.icon}</span> {s.title}</h1>
        <p className="mt-1 text-sm">{s.text}</p>
      </section>
      {certificate && status !== 'unknown' && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-3xl bg-white p-6 text-sm shadow-sm">
          <dt className="text-slate-500">Titulaire</dt><dd className="font-bold text-[#1a1a2e]">{certificate.holder}</dd>
          <dt className="text-slate-500">Compétence</dt><dd className="font-bold text-[#1a1a2e]">{certificate.skillName}</dd>
          <dt className="text-slate-500">Niveau</dt><dd>{certificate.levelLabel} — maîtrise attestée par un examinateur</dd>
          {certificate.centreName && (<><dt className="text-slate-500">Centre</dt><dd>{certificate.centreName}</dd></>)}
          <dt className="text-slate-500">Délivré le</dt><dd>{day(certificate.issuedOn)}</dd>
          <dt className="text-slate-500">Référence</dt><dd className="font-mono">{certificate.reference}</dd>
        </dl>
      )}
      {!certificate && <p className="text-center font-mono text-sm text-slate-500">{reference}</p>}
      <p className="text-center text-xs text-slate-500">Les certificats Play Perform sont délivrés après validation de la compétence par un examinateur ; le registre fait foi.</p>
    </main>
  );
}
