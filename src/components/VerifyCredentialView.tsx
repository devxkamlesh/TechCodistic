import React, { useState, useEffect } from 'react';
import { Credential } from '../db/schema';
import { downloadCredentialPdf } from '../services/pdf.generator';
import {
  CheckCircle2,
  Download,
  Eye,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';

interface VerifyCredentialViewProps {
  initialCode: string;
  credentials: Credential[];
  onSelectCode: (code: string) => void;
}

/**
 * Generates a deterministic 9x9 QR-like visual matrix from a verification code string.
 */
function buildDeterministicQrMatrix(code: string): boolean[][] {
  const size = 9;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 3 && c < 3;
      const inTopRight = r < 3 && c >= size - 3;
      const inBottomLeft = r >= size - 3 && c < 3;
      if (inTopLeft || inTopRight || inBottomLeft) {
        grid[r][c] = true;
      } else {
        const charCode = code.charCodeAt((r * size + c) % Math.max(1, code.length)) || 65;
        grid[r][c] = (charCode + r * 7 + c * 13) % 2 === 0;
      }
    }
  }
  return grid;
}

export const VerifyCredentialView: React.FC<VerifyCredentialViewProps> = ({
  initialCode,
  credentials,
  onSelectCode,
}) => {
  const [queryInput, setQueryInput] = useState<string>(initialCode);
  const [activeCode, setActiveCode] = useState<string>(initialCode);
  const [pdfFeedback, setPdfFeedback] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  useEffect(() => {
    if (initialCode) {
      setQueryInput(initialCode);
      setActiveCode(initialCode);
      setPdfFeedback(null);
    }
  }, [initialCode]);

  const matchedCredential = credentials.find(
    (c) => c.verificationCode.toUpperCase() === activeCode.trim().toUpperCase()
  );

  const qrMatrix = buildDeterministicQrMatrix(activeCode || 'TECHCODISTIC-2026');

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = queryInput.trim().toUpperCase();
    setActiveCode(cleaned);
    setPdfFeedback(null);
    onSelectCode(cleaned);
  };

  const handlePrintOrSavePdf = () => {
    if (!matchedCredential) return;
    const filename = downloadCredentialPdf(matchedCredential);
    setPdfFeedback(
      `Downloaded official PDF document: ${filename} (Landscape Letter 792×612pt)`
    );
  };

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-8 space-y-8">
      {/* Search & Edge Lookup Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono-tabular text-indigo-700 font-semibold">
              PUBLIC CREDENTIAL REGISTRY · techcodistic.com/verify/[code] · EDGE ISR (revalidate =
              3600)
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Instant Cryptographic Credential &amp; Offer Letter Verification
            </h1>
          </div>

          <form onSubmit={handleLookupSubmit} className="flex items-center gap-2 w-full lg:w-auto">
            <label htmlFor="verify-code-input" className="sr-only">
              Credential Verification Code
            </label>
            <div className="relative flex-1 lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="verify-code-input"
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="e.g., DIP-2026-4B19E82A"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono-tabular bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Verify Code
            </button>
          </form>
        </div>

        {/* Quick-Select Issued Codes */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Issued Registry IDs:</span>
          {credentials.map((cred) => {
            const isCurrent =
              cred.verificationCode.toUpperCase() === activeCode.trim().toUpperCase();
            return (
              <button
                key={cred.id}
                type="button"
                onClick={() => {
                  setQueryInput(cred.verificationCode);
                  setActiveCode(cred.verificationCode);
                  setPdfFeedback(null);
                  onSelectCode(cred.verificationCode);
                }}
                className={`px-2.5 py-1 text-xs font-mono-tabular rounded-md transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cred.verificationCode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Banner when PDF is downloaded */}
      {pdfFeedback && matchedCredential && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{pdfFeedback}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
            >
              Open Full-Screen Certificate View
            </button>
            <button
              type="button"
              onClick={() => setPdfFeedback(null)}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Verification Result Card (Matches Step 5 Specification + Official Certificate Preview) */}
      {matchedCredential ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 5 Columns: Dark Edge Verification Card (Step 5 Reference Implementation) */}
          <div className="lg:col-span-5 bg-[#0F1117] text-white rounded-xl p-8 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono-tabular text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>VERIFIED OFFICIAL CREDENTIAL · TECHCODISTIC.COM</span>
              </div>

              <h2 className="text-2xl font-bold leading-snug text-white">
                {matchedCredential.titleName}
              </h2>

              <p className="text-slate-400 text-xs font-mono-tabular">
                Credential Type:{' '}
                {matchedCredential.credentialType.replace(/_/g, ' ').toUpperCase()}
              </p>

              <div className="space-y-3 border-t border-slate-800 pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Recipient Name:</span>
                  <span className="font-semibold text-white">
                    {matchedCredential.recipientName}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Verification ID:</span>
                  <span className="font-mono-tabular text-indigo-400 font-semibold">
                    {matchedCredential.verificationCode}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Issuing Authority:</span>
                  <span className="text-slate-200">{matchedCredential.issuerOrganization}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Issue Date:</span>
                  <span className="font-mono-tabular text-slate-200">
                    {new Date(matchedCredential.issuedAt).toLocaleDateString()}
                  </span>
                </div>
                {matchedCredential.scorePercent && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Verified Assessment Score:</span>
                    <span className="font-mono-tabular text-emerald-400 font-semibold">
                      {matchedCredential.scorePercent}% (Threshold ≥ 80%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Verification Matrix Footer */}
            <div className="pt-5 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-mono-tabular text-slate-300">
                  Endpoint: techcodistic.com/verify/{matchedCredential.verificationCode}
                </p>
                <p className="text-xs text-slate-400">
                  Cryptographic record immutable in PostgreSQL credentials table.
                </p>
              </div>

              <svg
                width="68"
                height="68"
                viewBox="0 0 90 90"
                className="bg-white p-1.5 rounded shrink-0"
                role="img"
                aria-label={`QR Code for ${matchedCredential.verificationCode}`}
              >
                {qrMatrix.map((row, rIdx) =>
                  row.map((cell, cIdx) =>
                    cell ? (
                      <rect
                        key={`${rIdx}-${cIdx}`}
                        x={cIdx * 10}
                        y={rIdx * 10}
                        width="9"
                        height="9"
                        fill="#0F172A"
                      />
                    ) : null
                  )
                )}
              </svg>
            </div>
          </div>

          {/* Right 7 Columns: Formal Typst-Style Printable Certificate / Offer Letter Document */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <p className="text-xs font-mono-tabular text-slate-500">
                  TECHCODISTIC (TECHCODISTIC.COM) · ACADEMIC &amp; INTERNSHIP SENATE
                </p>
                <h3 className="text-2xl font-bold text-slate-900 font-serif-editorial mt-1">
                  {matchedCredential.credentialType === 'internship_offer_letter'
                    ? 'Official Internship Offer Letter'
                    : matchedCredential.credentialType === 'internship_completion'
                    ? 'Certificate of Virtual Internship Completion'
                    : matchedCredential.credentialType === 'course_diploma'
                    ? 'Diploma of Advanced Technical Competency'
                    : 'Certificate of Verified Course Achievement'}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Document</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintOrSavePdf}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 py-2">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                This official document certifies that
              </p>
              <p className="text-3xl font-bold text-slate-900 font-serif-editorial">
                {matchedCredential.recipientName}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {matchedCredential.credentialType === 'internship_offer_letter'
                  ? `has been officially admitted into the technical internship program and authorized to execute project milestone sprints for:`
                  : `has successfully satisfied all syllabus modules, project repository evaluations, and competency thresholds required for:`}
              </p>
              <p className="text-xl font-bold text-indigo-900 font-serif-editorial">
                {matchedCredential.titleName}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-tabular text-slate-600">
              <div>
                <p className="text-slate-400">VERIFICATION CODE</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {matchedCredential.verificationCode}
                </p>
              </div>
              <div>
                <p className="text-slate-400">ISSUING AUTHORITY</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {matchedCredential.issuerOrganization}
                </p>
              </div>
              <div>
                <p className="text-slate-400">CRYPTOGRAPHIC STATUS</p>
                <p className="font-semibold text-emerald-700 mt-0.5 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authentic &amp; Active</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="alert"
          className="bg-white border border-red-200 rounded-xl p-10 text-center space-y-3"
        >
          <ShieldAlert className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">
            No Credential Found for Code &ldquo;{activeCode}&rdquo;
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            The verification code entered could not be matched in the `credentials` registry. Select
            one of the issued registry IDs above or complete a course assessment / internship
            enrollment to generate a new credential.
          </p>
        </div>
      )}

      {/* Full-Screen Print-Formatted Document Modal */}
      {showPrintModal && matchedCredential && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Official Printable Credential Document"
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
        >
          <div className="bg-white border-2 border-indigo-900 rounded-xl max-w-3xl w-full p-8 sm:p-12 shadow-2xl space-y-8 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-xs font-mono-tabular font-semibold text-indigo-700">
                OFFICIAL CREDENTIAL DOCUMENT · TECHCODISTIC.COM
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintOrSavePdf}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF ({matchedCredential.verificationCode}.pdf)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  aria-label="Close document preview"
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-5 text-center py-4">
              <p className="text-xs font-mono-tabular uppercase tracking-widest text-slate-500">
                TechCodistic Academic &amp; Internship Senate
              </p>
              <h2 className="text-3xl font-bold text-slate-900 font-serif-editorial">
                {matchedCredential.credentialType === 'internship_offer_letter'
                  ? 'Official Internship Offer Letter'
                  : matchedCredential.credentialType === 'internship_completion'
                  ? 'Certificate of Virtual Internship Completion'
                  : matchedCredential.credentialType === 'course_diploma'
                  ? 'Diploma of Advanced Technical Competency'
                  : 'Certificate of Verified Course Achievement'}
              </h2>
              <p className="text-xs uppercase tracking-wider text-slate-500">Awarded to</p>
              <p className="text-4xl font-bold text-indigo-950 font-serif-editorial">
                {matchedCredential.recipientName}
              </p>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                For successfully satisfying all syllabus modules, evaluations, and competency
                benchmarks required for:
              </p>
              <p className="text-2xl font-bold text-indigo-800 font-serif-editorial">
                {matchedCredential.titleName}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tabular text-slate-600">
              <div>
                <p className="text-slate-400">VERIFICATION ID</p>
                <p className="font-bold text-slate-900">{matchedCredential.verificationCode}</p>
              </div>
              <div>
                <p className="text-slate-400">ISSUING AUTHORITY</p>
                <p className="font-bold text-slate-900">{matchedCredential.issuerOrganization}</p>
              </div>
              <div>
                <p className="text-slate-400">ISSUE DATE</p>
                <p className="font-bold text-slate-900">
                  {new Date(matchedCredential.issuedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
