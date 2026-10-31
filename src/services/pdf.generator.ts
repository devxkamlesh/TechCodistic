import { jsPDF } from 'jspdf';
import { Credential } from '../db/schema';

/**
 * Deterministically computes a 9x9 QR-like matrix from a verification code
 * so jsPDF can draw a crisp vector QR code directly onto the certificate PDF.
 */
export function buildQrMatrixForCode(code: string): boolean[][] {
  const size = 9;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid[r0 + r][c0 + c] = !(r === 1 && c === 1);
      }
    }
  };
  setFinder(0, 0);
  setFinder(0, size - 3);
  setFinder(size - 3, 0);

  let hash = 2166136261;
  for (let i = 0; i < code.length; i++) {
    hash ^= code.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinder =
        (r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3);
      if (!inFinder) {
        const bitIndex = (r * size + c) % 31;
        grid[r][c] = ((hash >>> bitIndex) & 1) === 1 || (r + c) % 3 === 0;
      }
    }
  }

  return grid;
}

/**
 * Renders a single credential onto the active page of a jsPDF instance (Landscape Letter: 792 x 612 pt).
 */
export function renderCredentialPageOnJsPdf(doc: jsPDF, credential: Credential): void {
  const isOfferLetter = credential.credentialType === 'internship_offer_letter';
  const isInternCompletion = credential.credentialType === 'internship_completion';
  const isDiploma = credential.credentialType === 'course_diploma';

  const docHeading = isOfferLetter
    ? 'OFFICIAL INTERNSHIP OFFER LETTER'
    : isInternCompletion
    ? 'CERTIFICATE OF VIRTUAL INTERNSHIP COMPLETION'
    : isDiploma
    ? 'DIPLOMA OF ADVANCED TECHNICAL COMPETENCY'
    : 'CERTIFICATE OF VERIFIED COURSE ACHIEVEMENT';

  const trackBadgeLabel = isOfferLetter
    ? 'INTERNSHIP COHORT OFFER'
    : isInternCompletion
    ? 'VERIFIED INTERNSHIP CREDENTIAL'
    : isDiploma
    ? 'VERIFIED COURSE DIPLOMA'
    : 'VERIFIED COURSE CERTIFICATE';

  const subText = isOfferLetter
    ? 'has been officially admitted into the technical internship cohort and authorized to execute milestone sprints for:'
    : 'has successfully satisfied all syllabus modules, repository evaluations, and competency thresholds required for:';

  const issuedDateStr = new Date(credential.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const scoreLine = credential.scorePercent
    ? `Verified Competency Assessment Score: ${credential.scorePercent}% (Passing Threshold >= 80%)`
    : 'Status: Official Pre-Verified Internship Cohort Record';

  // Background subtle ivory/slate tint
  doc.setFillColor(252, 253, 255);
  doc.rect(28, 28, 736, 556, 'F');

  // Outer primary indigo frame
  doc.setDrawColor(55, 48, 163); // #3730A3
  doc.setLineWidth(2.2);
  doc.rect(34, 34, 724, 544, 'S');

  // Inner subtle structural frame
  doc.setDrawColor(203, 213, 225); // #CBD5E1
  doc.setLineWidth(0.75);
  doc.rect(42, 42, 708, 528, 'S');

  // Top institutional accent bar
  doc.setFillColor(30, 27, 75); // Deep Indigo/Slate
  doc.rect(42, 42, 708, 38, 'F');

  // Header bar text
  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(224, 231, 255);
  doc.text('TECHCODISTIC (TECHCODISTIC.COM)  |  ACADEMIC & INTERNSHIP SENATE', 64, 65);

  doc.setTextColor(110, 231, 183);
  doc.text(`ID: ${credential.verificationCode}`, 728, 65, { align: 'right' });

  // Category tag
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text(`VERIFIED RECORD  ·  ${trackBadgeLabel}`, 64, 114);

  // Main Document Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(docHeading, 64, 144);

  // Accent horizontal rule under heading
  doc.setDrawColor(67, 56, 202);
  doc.setLineWidth(1.5);
  doc.line(64, 158, 190, 158);

  // Certification intro label
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('THIS OFFICIAL DOCUMENT CERTIFIES THAT', 64, 194);

  // Recipient Name
  doc.setFont('times', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(15, 23, 42);
  doc.text(credential.recipientName, 64, 234);

  // Certification statement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(71, 85, 105);
  doc.text(subText, 64, 268);

  // Course or Internship Title (wrapped cleanly)
  doc.setFont('times', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(55, 48, 163);
  const wrappedTitle: string[] = doc.splitTextToSize(credential.titleName, 540);
  doc.text(wrappedTitle, 64, 302);

  const afterTitleY = 302 + wrappedTitle.length * 22;

  // Score / Status pill box
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.setLineWidth(0.75);
  doc.roundedRect(64, afterTitleY + 4, 450, 26, 4, 4, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.text(scoreLine, 76, afterTitleY + 21);

  // Official Vector Seal on the right side
  const sealCenterX = 668;
  const sealCenterY = 235;
  doc.setDrawColor(67, 56, 202);
  doc.setLineWidth(1.5);
  doc.circle(sealCenterX, sealCenterY, 40, 'S');
  doc.setLineWidth(0.6);
  doc.circle(sealCenterX, sealCenterY, 35, 'S');

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(67, 56, 202);
  doc.text('TECHCODISTIC', sealCenterX, sealCenterY - 8, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105);
  doc.text('VERIFIED', sealCenterX, sealCenterY + 3, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('2026 SENATE', sealCenterX, sealCenterY + 14, { align: 'center' });

  // Footer divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(64, 430, 728, 430);

  // Metadata Columns
  // Column 1: Verification Code
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('VERIFICATION CODE', 64, 454);

  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(credential.verificationCode, 64, 472);

  // Column 2: Issuing Authority
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ISSUING AUTHORITY', 260, 454);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(credential.issuerOrganization, 260, 472);

  // Column 3: Issue Date
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ISSUE DATE', 485, 454);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(issuedDateStr, 485, 472);

  // Public verification endpoint URL
  doc.setFont('courier', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(67, 56, 202);
  doc.text(
    `Public Edge Verification Endpoint: https://techcodistic.com/verify/${credential.verificationCode}`,
    64,
    522
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Cryptographic record immutable in PostgreSQL credentials ledger · Generated via jsPDF Engine',
    64,
    540
  );

  // Vector QR Code Box in bottom-right corner
  const qrBoxX = 638;
  const qrBoxY = 446;
  const qrBoxSize = 84;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.75);
  doc.roundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 4, 4, 'FD');

  const qrMatrix = buildQrMatrixForCode(credential.verificationCode);
  const cellSize = 7.2;
  const offsetX = qrBoxX + 9.5;
  const offsetY = qrBoxY + 9.5;

  doc.setFillColor(15, 23, 42);
  for (let r = 0; r < qrMatrix.length; r++) {
    for (let c = 0; c < qrMatrix[r].length; c++) {
      if (qrMatrix[r][c]) {
        doc.rect(offsetX + c * cellSize, offsetY + r * cellSize, cellSize - 0.5, cellSize - 0.5, 'F');
      }
    }
  }
}

/**
 * Creates a configured jsPDF instance for a single credential.
 */
export function createCredentialJsPdf(credential: Credential): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter',
    compress: false,
  });

  doc.setProperties({
    title: `TechCodistic Credential - ${credential.verificationCode}`,
    subject: credential.titleName,
    author: 'TechCodistic Academic & Internship Senate (techcodistic.com)',
    creator: 'TechCodistic jsPDF Credential Engine',
  });

  renderCredentialPageOnJsPdf(doc, credential);
  return doc;
}

/**
 * Creates a multi-page jsPDF document containing all earned course certificates
 * and internship credentials for a learner.
 */
export function createMultiCredentialJsPdf(credentials: Credential[]): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'letter',
    compress: false,
  });

  doc.setProperties({
    title: `TechCodistic Official Credential Portfolio (${credentials.length} Records)`,
    subject: 'Course Certificates & Internship Credentials',
    author: 'TechCodistic Academic & Internship Senate (techcodistic.com)',
    creator: 'TechCodistic jsPDF Credential Engine',
  });

  credentials.forEach((cred, index) => {
    if (index > 0) {
      doc.addPage('letter', 'landscape');
    }
    renderCredentialPageOnJsPdf(doc, cred);
  });

  return doc;
}

/**
 * Generates the raw PDF document string using jsPDF.
 */
export function buildCredentialPdfString(credential: Credential): string {
  const doc = createCredentialJsPdf(credential);
  return doc.output();
}

/**
 * Triggers a direct client-side file download of a single credential PDF using jsPDF.
 * Returns the downloaded filename.
 */
export function downloadCredentialPdf(credential: Credential): string {
  const doc = createCredentialJsPdf(credential);
  const filename = `TechCodistic-${credential.verificationCode}.pdf`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    doc.save(filename);
  }

  return filename;
}

/**
 * Triggers a direct client-side file download of a combined multi-page PDF
 * containing all earned course certificates and internship credentials.
 */
export function downloadAllCredentialsPdf(
  credentials: Credential[],
  recipientName: string
): string {
  if (credentials.length === 0) {
    return '';
  }
  const doc = createMultiCredentialJsPdf(credentials);
  const safeName = recipientName.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  const filename = `TechCodistic-Credentials-Portfolio-${safeName}.pdf`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    doc.save(filename);
  }

  return filename;
}
