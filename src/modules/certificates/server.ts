/** Server-only API of the certificates module (API routes and the server-rendered verification page). */
export { issueIfEligible, issueInBackground, certificateSecret, siteUrl } from './application/issue';
export { findCertificate, liveCertificate, revokeCertificate } from './infra/certificate-repository';
export type { StoredCertificate } from './infra/certificate-repository';
export { certificatePdf } from './infra/certificate-pdf';
export type { CertificateRecord, VerificationStatus } from './domain/certificate';
export {
  certificateSignature, verificationStatus, verificationUrl, publicHolderName, certificateTitle, linkedInAddToProfileUrl, linkedInShareUrl,
} from './domain/certificate';
