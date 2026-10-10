import { getAuthToken } from '@/lib/auth-token';

export interface CertificateLinks { reference: string; issuedOn: string; revoked: boolean; verifyUrl: string; linkedInAddUrl: string; linkedInShareUrl: string }

/** The learner's certificate for a skill (issued on the spot once eligible); null while not earned or unreachable. */
export async function fetchCertificate(profileId: string, skillId: string): Promise<CertificateLinks | null> {
  try {
    const res = await fetch(`/api/certificates?profileId=${encodeURIComponent(profileId)}&skillId=${encodeURIComponent(skillId)}`, { headers: { authorization: `Bearer ${await getAuthToken()}` } });
    return res.ok ? ((await res.json()) as { certificate: CertificateLinks | null }).certificate : null;
  } catch { return null; }
}

/** Downloads the PDF (the request needs the session, so it goes through a blob). Returns the error to show, or null. */
export async function downloadCertificatePdf(reference: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/certificates/${encodeURIComponent(reference)}/pdf`, { headers: { authorization: `Bearer ${await getAuthToken()}` } });
    if (!res.ok) return ((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Téléchargement impossible.';
    const url = URL.createObjectURL(await res.blob());
    const link = Object.assign(document.createElement('a'), { href: url, download: `certificat-${reference}.pdf` });
    link.click();
    URL.revokeObjectURL(url);
    return null;
  } catch { return 'Téléchargement impossible.'; }
}
