import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import QRCode from 'qrcode';
import { certificateTitle, type CertificateRecord } from '../domain/certificate';

/** Server-side only. A4 landscape certificate with the QR code of its public verification page. */
const VIOLET = rgb(0.43, 0.16, 0.85);
const INK = rgb(0.1, 0.1, 0.18);
const GREY = rgb(0.4, 0.42, 0.48);

/** The standard PDF fonts only know Western characters: accents are kept, anything else is simplified or replaced. */
export function printable(text: string, font: PDFFont): string {
  const known = new Set(font.getCharacterSet());
  return [...text].map((ch) => {
    if (known.has(ch.codePointAt(0) ?? 0)) return ch;
    const plain = ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return [...plain].every((c) => known.has(c.codePointAt(0) ?? 0)) ? plain : '?';
  }).join('');
}

const formatDay = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function centred(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color = INK) {
  const safe = printable(text, font);
  page.drawText(safe, { x: (page.getWidth() - font.widthOfTextAtSize(safe, size)) / 2, y, size, font, color });
}

export async function certificatePdf(c: CertificateRecord, verifyUrl: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const [regular, bold, italic] = await Promise.all([pdf.embedFont(StandardFonts.Helvetica), pdf.embedFont(StandardFonts.HelveticaBold), pdf.embedFont(StandardFonts.HelveticaOblique)]);
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, borderColor: VIOLET, borderWidth: 4 });
  page.drawRectangle({ x: 30, y: 30, width: width - 60, height: height - 60, borderColor: rgb(0.96, 0.62, 0.04), borderWidth: 1 });

  centred(page, 'PLAY PERFORM', 520, bold, 14, VIOLET);
  centred(page, 'Certificat de compétence', 470, bold, 34);
  centred(page, 'décerné à', 435, italic, 14, GREY);
  centred(page, `${c.firstName} ${c.lastName}`, 395, bold, 30, VIOLET);
  centred(page, 'pour avoir validé la compétence', 360, regular, 14, GREY);
  centred(page, `« ${c.skillName} »`, 325, bold, 22);
  centred(page, `Niveau ${c.levelLabel} — maîtrise attestée par un examinateur`, 295, regular, 13, GREY);
  if (c.centreName) centred(page, `Formation suivie au centre ${c.centreName}`, 270, regular, 13, GREY);
  centred(page, `Délivré le ${formatDay(c.issuedOn)}`, 240, bold, 13);

  const qr = await pdf.embedPng(await QRCode.toBuffer(verifyUrl, { errorCorrectionLevel: 'M', margin: 1, width: 300 }));
  page.drawImage(qr, { x: width - 175, y: 50, width: 120, height: 120 });
  page.drawText('Scannez pour vérifier', { x: width - 171, y: 40, size: 9, font: regular, color: GREY });

  page.drawText(printable(`Référence : ${c.reference}`, bold), { x: 55, y: 95, size: 11, font: bold, color: INK });
  page.drawText('Authenticité vérifiable dans le registre Play Perform :', { x: 55, y: 77, size: 9, font: regular, color: GREY });
  page.drawText(printable(verifyUrl, regular), { x: 55, y: 63, size: 8, font: regular, color: VIOLET });

  pdf.setTitle(`Certificat Play Perform ${c.reference} — ${certificateTitle(c)}`);
  pdf.setAuthor('Play Perform');
  pdf.setSubject(`${c.firstName} ${c.lastName} — ${certificateTitle(c)}`);
  pdf.setKeywords([c.reference, 'Play Perform', 'certificat', verifyUrl]);
  pdf.setCreator('Play Perform');
  pdf.setProducer('Play Perform');
  pdf.setCreationDate(new Date(`${c.issuedOn}T12:00:00Z`));
  return pdf.save();
}
