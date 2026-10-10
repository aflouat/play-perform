import type { Metadata } from 'next';
import { VerificationView } from '@/modules/certificates';
import { certificateSecret, certificateTitle, findCertificate, publicHolderName, verificationStatus } from '@/modules/certificates/server';

type Props = { params: Promise<{ reference: string }>; searchParams: Promise<{ s?: string }> };

const load = async (reference: string) => findCertificate(decodeURIComponent(reference)).catch(() => null);

/** Preview of the page when shared (LinkedIn reads these Open Graph tags). */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await load((await params).reference);
  if (!c || c.revokedAt) return { title: 'Vérification de certificat | Play Perform', robots: { index: false } };
  const title = `${publicHolderName(c)} a obtenu le certificat « ${certificateTitle(c)} »`;
  const description = `Certificat Play Perform vérifiable (réf. ${c.reference}) : compétence validée par un examinateur${c.centreName ? `, centre ${c.centreName}` : ''}.`;
  return { title, description, robots: { index: false }, openGraph: { title, description, type: 'article', siteName: 'Play Perform' } };
}

/** Public verification of a certificate (QR code or reference typed by hand). */
export default async function VerifyPage({ params, searchParams }: Props) {
  const reference = decodeURIComponent((await params).reference);
  const signature = (await searchParams).s ?? null;
  const c = await load(reference);
  const status = verificationStatus(c, signature, certificateSecret());
  return (
    <VerificationView status={status} reference={reference} certificate={c && {
      holder: publicHolderName(c), skillName: c.skillName, levelLabel: c.levelLabel, centreName: c.centreName, issuedOn: c.issuedOn, reference: c.reference,
    }} />
  );
}
