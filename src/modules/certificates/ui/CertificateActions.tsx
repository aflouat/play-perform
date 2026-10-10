'use client';

import { useEffect, useState } from 'react';
import { downloadCertificatePdf, fetchCertificate, type CertificateLinks } from '../infra/certificate-client';

/** On the diploma page: the secure PDF (QR code), its public verification page, and LinkedIn. */
export function CertificateActions({ profileId, skillId }: { profileId: string; skillId: string }) {
  const [certificate, setCertificate] = useState<CertificateLinks | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { fetchCertificate(profileId, skillId).then(setCertificate); }, [profileId, skillId]);

  if (!certificate) return null;
  if (certificate.revoked) return <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">Ce certificat a été révoqué par Play Perform. Contacte ton centre.</p>;
  return (
    <section aria-label="Mon certificat" className="space-y-3 rounded-3xl bg-white p-5 shadow-sm print:hidden">
      <h2 className="font-black text-[#1a1a2e]">🏅 Mon certificat vérifiable</h2>
      <p className="text-sm text-slate-600">
        Référence <span className="font-mono">{certificate.reference}</span> : son QR code renvoie vers la page de vérification officielle, que tu peux montrer à un employeur ou une école.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={async () => setError(await downloadCertificatePdf(certificate.reference))}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white">📄 Télécharger le PDF</button>
        <a href={certificate.linkedInAddUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#0a66c2] px-4 py-2 text-sm font-bold text-white">in Ajouter à mon profil LinkedIn</a>
        <a href={certificate.linkedInShareUrl} target="_blank" rel="noreferrer" className="rounded-xl border-2 border-[#0a66c2] px-4 py-2 text-sm font-bold text-[#0a66c2]">Partager sur LinkedIn</a>
        <a href={certificate.verifyUrl} target="_blank" rel="noreferrer" className="rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Voir la page de vérification</a>
      </div>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    </section>
  );
}
