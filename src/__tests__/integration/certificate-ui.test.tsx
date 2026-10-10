import { render, screen } from '@testing-library/react';
import { CertificateActions } from '@/modules/certificates/ui/CertificateActions';
import { VerificationView } from '@/modules/certificates/ui/VerificationView';
import * as client from '@/modules/certificates/infra/certificate-client';

jest.mock('@/modules/certificates/infra/certificate-client');

const verified = { holder: 'Léa M.', skillName: 'Solutions et dilutions', levelLabel: 'Expertise', centreName: 'Centre Alpha', issuedOn: '2026-10-09', reference: 'PP-0A1B2C3D' };

describe('certificate on the diploma page', () => {
  it('offers the PDF, LinkedIn and the verification page', async () => {
    jest.mocked(client.fetchCertificate).mockResolvedValue({ reference: 'PP-0A1B2C3D', issuedOn: '2026-10-09', revoked: false,
      verifyUrl: 'https://playperform.fr/verifier/PP-0A1B2C3D?s=sig', linkedInAddUrl: 'https://www.linkedin.com/profile/add?x=1', linkedInShareUrl: 'https://www.linkedin.com/sharing/share-offsite/?url=y' });
    render(<CertificateActions profileId="p1" skillId="labo-solutions" />);
    expect(await screen.findByRole('button', { name: /Télécharger le PDF/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ajouter à mon profil LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/profile/add?x=1');
    expect(screen.getByRole('link', { name: /Partager sur LinkedIn/ })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: /page de vérification/ })).toHaveAttribute('href', 'https://playperform.fr/verifier/PP-0A1B2C3D?s=sig');
  });
});

describe('public verification page', () => {
  it('confirms an authentic certificate, holder as first name and initial', () => {
    render(<VerificationView status="valid" reference="PP-0A1B2C3D" certificate={verified} />);
    expect(screen.getByRole('status')).toHaveTextContent('Certificat authentique');
    expect(screen.getByText('Léa M.')).toBeInTheDocument();
  });

  it('warns about a forged document and a revoked or unknown certificate', () => {
    const { rerender } = render(<VerificationView status="forged" reference="PP-0A1B2C3D" certificate={verified} />);
    expect(screen.getByRole('status')).toHaveTextContent('Document non conforme');
    rerender(<VerificationView status="revoked" reference="PP-0A1B2C3D" certificate={verified} />);
    expect(screen.getByRole('status')).toHaveTextContent('révoqué');
    rerender(<VerificationView status="unknown" reference="PP-XXXX" certificate={null} />);
    expect(screen.getByRole('status')).toHaveTextContent('Référence inconnue');
  });
});
