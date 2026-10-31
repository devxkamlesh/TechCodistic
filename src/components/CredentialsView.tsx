import React, { useState } from 'react';
import {
  Course,
  Credential,
  DRIZZLE_SCHEMA_SOURCE,
  Enrollment,
  Internship,
  InternshipApplication,
  User,
} from '../db/schema';
import { calculateCircularProgressGeometry } from '../services/domain.logic';
import {
  downloadAllCredentialsPdf,
  downloadCredentialPdf,
} from '../services/pdf.generator';
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  FileDown,
  RotateCcw,
} from 'lucide-react';

interface CredentialsViewProps {
  mode: 'learning' | 'credentials';
  user: User;
  courses: Course[];
  enrollments: Enrollment[];
  internships: Internship[];
  applications: InternshipApplication[];
  credentials: Credential[];
  onSelectCourse: (courseId: string) => void;
  onSelectInternshipTab: () => void;
  onInspectCredential: (verificationCode: string) => void;
  onResetDemoData: () => void;
}

interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  isCompleted?: boolean;
  label: string;
}

export const CircularProgressIndicator: React.FC<CircularProgressProps> = ({
  percent,
  size = 52,
  strokeWidth = 4.5,
  isCompleted = false,
  label,
}) => {
  const geom = calculateCircularProgressGeometry(percent, size, strokeWidth);
  const strokeColor = isCompleted || geom.clampedPercent === 100 ? '#059669' : '#4338CA';

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: geom.size, height: geom.size }}
      role="progressbar"
      aria-valuenow={geom.clampedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg
        width={geom.size}
        height={geom.size}
        viewBox={`0 0 ${geom.size} ${geom.size}`}
        className="-rotate-90"
      >
        <circle
          cx={geom.center}
          cy={geom.center}
          r={geom.radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={geom.strokeWidth}
        />
        <circle
          cx={geom.center}
          cy={geom.center}
          r={geom.radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={geom.strokeWidth}
          strokeDasharray={geom.circumference}
          strokeDashoffset={geom.strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[11px] font-bold font-mono-tabular text-slate-900">
        {geom.clampedPercent}%
      </span>
    </div>
  );
};

type CredentialFilterTab = 'all' | 'course' | 'internship';

function getCredentialDownloadLabel(type: Credential['credentialType']): string {
  switch (type) {
    case 'course_diploma':
      return 'Download Diploma PDF';
    case 'course_certificate':
      return 'Download Certificate PDF';
    case 'internship_offer_letter':
      return 'Download Offer Letter PDF';
    case 'internship_completion':
      return 'Download Internship PDF';
  }
}

export const CredentialsView: React.FC<CredentialsViewProps> = ({
  mode,
  user,
  courses,
  enrollments,
  internships,
  applications,
  credentials,
  onSelectCourse,
  onSelectInternshipTab,
  onInspectCredential,
  onResetDemoData,
}) => {
  const [showArchitectureCode, setShowArchitectureCode] = useState<boolean>(false);
  const [downloadedNotice, setDownloadedNotice] = useState<string | null>(null);
  const [credFilter, setCredFilter] = useState<CredentialFilterTab>('all');

  const userEnrollments = enrollments.filter((e) => e.userId === user.id);
  const userApps = applications.filter((a) => a.userId === user.id);
  const userCreds = credentials.filter((c) => c.userId === user.id);

  const courseCredsCount = userCreds.filter(
    (c) => c.credentialType === 'course_certificate' || c.credentialType === 'course_diploma'
  ).length;
  const internshipCredsCount = userCreds.filter(
    (c) =>
      c.credentialType === 'internship_offer_letter' ||
      c.credentialType === 'internship_completion'
  ).length;

  const filteredCreds = userCreds.filter((c) => {
    if (credFilter === 'course') {
      return c.credentialType === 'course_certificate' || c.credentialType === 'course_diploma';
    }
    if (credFilter === 'internship') {
      return (
        c.credentialType === 'internship_offer_letter' ||
        c.credentialType === 'internship_completion'
      );
    }
    return true;
  });

  const handleSavePdf = (cred: Credential) => {
    const filename = downloadCredentialPdf(cred);
    setDownloadedNotice(
      `Exported official jsPDF document: ${filename} (${cred.titleName})`
    );
  };

  const handleExportAllPdfs = () => {
    const filename = downloadAllCredentialsPdf(userCreds, user.name);
    if (filename) {
      setDownloadedNotice(
        `Exported multi-page jsPDF portfolio (${userCreds.length} credentials): ${filename}`
      );
    }
  };

  const enrollmentsSection = (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Active &amp; Completed Courses ({userEnrollments.length})
          </h2>
          <p className="text-sm text-slate-600">
            Visual circular progress indicators and synchronized module bitmaps across your enrolled
            courses.
          </p>
        </div>
      </div>

      {/* Active Course Cards with Circular Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {userEnrollments.map((enr) => {
          const course = courses.find((c) => c.id === enr.courseId);
          if (!course) return null;

          const earnedCourseCred = userCreds.find(
            (c) =>
              c.referenceId === course.id &&
              (c.credentialType === 'course_certificate' || c.credentialType === 'course_diploma')
          );

          return (
            <article
              key={`card-${enr.id}`}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
            >
              <div className="flex items-start justify-between gap-5">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono-tabular text-slate-500">
                    <span className="font-semibold text-indigo-700">
                      #{String(course.catalogNumber).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{course.type}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.durationHours} hrs</span>
                    <span aria-hidden="true">·</span>
                    <span>{enr.completedLessonIds.length}/3 Modules Synced</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500">{course.category}</p>
                </div>

                {/* Circular Progress Ring */}
                <CircularProgressIndicator
                  percent={enr.progressPercent}
                  size={56}
                  strokeWidth={5}
                  isCompleted={enr.isCompleted}
                  label={`Completion status for ${course.title}: ${enr.progressPercent}%`}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-mono-tabular">
                  {enr.isCompleted ? (
                    <span className="text-emerald-700 font-semibold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Certificate Issued · Quiz: {enr.quizScore}%</span>
                    </span>
                  ) : (
                    <span className="text-indigo-700 font-semibold">
                      In Progress · {enr.progressPercent}% Complete
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {earnedCourseCred && (
                    <button
                      type="button"
                      onClick={() => handleSavePdf(earnedCourseCred)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectCourse(course.id)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{enr.isCompleted ? 'Review Course' : 'Continue Modules'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Detailed Enrolled Courses Table with Inline Circular Progress Rings */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3.5 px-5">Course Title</th>
                <th className="py-3.5 px-4">Track Type</th>
                <th className="py-3.5 px-4">Completion Status</th>
                <th className="py-3.5 px-4 text-right">Quiz Score</th>
                <th className="py-3.5 px-4">Lifecycle State</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {userEnrollments.map((enr) => {
                const course = courses.find((c) => c.id === enr.courseId);
                if (!course) return null;

                return (
                  <tr key={enr.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      #{String(course.catalogNumber).padStart(2, '0')} · {course.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 capitalize">
                      {course.type}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <CircularProgressIndicator
                          percent={enr.progressPercent}
                          size={38}
                          strokeWidth={3.5}
                          isCompleted={enr.isCompleted}
                          label={`Table progress for ${course.title}: ${enr.progressPercent}%`}
                        />
                        <span className="text-xs font-mono-tabular text-slate-600">
                          {enr.completedLessonIds.length}/3 Modules
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-xs text-slate-700">
                      {enr.quizScore !== null ? `${enr.quizScore}%` : 'Not Taken'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono-tabular">
                      {enr.isCompleted ? (
                        <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Certificate Issued</span>
                        </span>
                      ) : (
                        <span className="text-indigo-700 font-semibold">
                          Lesson Progress Synced
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectCourse(course.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{enr.isCompleted ? 'Review Course' : 'Continue Modules'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const credentialsSection = (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Issued Cryptographic Credentials &amp; Offer Letters ({userCreds.length})
          </h2>
          <p className="text-sm text-slate-600">
            Download official landscape PDF certificates and internship credentials generated via
            jsPDF or inspect their public QR verification record.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExportAllPdfs}
            className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Export All Credentials (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs for Course Certificates vs Internship Credentials */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setCredFilter('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            credFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Credentials ({userCreds.length})
        </button>
        <button
          type="button"
          onClick={() => setCredFilter('course')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            credFilter === 'course'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Course Certificates &amp; Diplomas ({courseCredsCount})
        </button>
        <button
          type="button"
          onClick={() => setCredFilter('internship')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            credFilter === 'internship'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Internship Credentials &amp; Offer Letters ({internshipCredsCount})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCreds.map((cred) => {
          const pdfButtonLabel = getCredentialDownloadLabel(cred.credentialType);

          return (
            <article
              key={cred.id}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular text-slate-500">
                  <span className="font-semibold text-emerald-700">
                    VERIFIED · {cred.credentialType.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span>Issued: {new Date(cred.issuedAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 font-serif-editorial">
                  {cred.titleName}
                </h3>

                <div className="text-xs text-slate-600 space-y-1 font-mono-tabular pt-1">
                  <p>
                    Recipient:{' '}
                    <span className="font-semibold text-slate-900">{cred.recipientName}</span>
                  </p>
                  <p>
                    Issuer: <span className="text-slate-800">{cred.issuerOrganization}</span>
                  </p>
                  <p>
                    Verification ID:{' '}
                    <span className="font-semibold text-indigo-700">{cred.verificationCode}</span>
                  </p>
                  {typeof cred.scorePercent === 'number' ? (
                    <p>
                      Competency Score:{' '}
                      <span className="font-semibold text-emerald-700">
                        {cred.scorePercent}% (Threshold &ge; 80%)
                      </span>
                    </p>
                  ) : (
                    <p>
                      Cohort Status:{' '}
                      <span className="font-semibold text-emerald-700">
                        Official Pre-Verified Admission Record
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSavePdf(cred)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{pdfButtonLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onInspectCredential(cred.verificationCode)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Open /verify/{cred.verificationCode}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-8 space-y-8">
      {/* Student Profile & Summary Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono-tabular">
            <span>STUDENT LEARNER RECORD</span>
            <span>·</span>
            <span>{user.email}</span>
            <span>·</span>
            <span>Role: {user.role.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {mode === 'learning'
              ? `${user.name} — Active Learning & Sprint Progress`
              : `${user.name} — Verified Credentials & Offer Letters`}
          </h1>
          <p className="text-sm text-slate-600">
            Unified academic transcript and cryptographic credential ledger backed by edge-cached QR
            verification and instant jsPDF export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowArchitectureCode((prev) => !prev)}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>
              {showArchitectureCode
                ? 'Hide Next.js + Drizzle Source'
                : 'Inspect Next.js + Drizzle Schema'}
            </span>
          </button>

          <button
            type="button"
            onClick={onResetDemoData}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Seed State</span>
          </button>
        </div>
      </div>

      {/* Global PDF Export Status Notification Banner */}
      {downloadedNotice && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{downloadedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadedNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Optional Next.js App Router + Drizzle ORM Source Code Drawer */}
      {showArchitectureCode && (
        <section className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">
                Next.js App Router + Drizzle ORM Production Schema (src/db/schema.ts)
              </h2>
              <p className="text-xs text-slate-400">
                Complete PostgreSQL schema with composite indexes and serverless connection pooler
                configuration.
              </p>
            </div>
          </div>
          <pre className="text-xs font-mono-tabular text-indigo-200 overflow-x-auto max-h-96 p-4 bg-slate-950 rounded-lg leading-relaxed">
            {DRIZZLE_SCHEMA_SOURCE}
          </pre>
        </section>
      )}

      {/* Prioritize Active Courses on 'My Learning' tab, or Credentials on 'Credentials' tab */}
      {mode === 'learning' ? (
        <>
          {enrollmentsSection}
          <div className="pt-4 border-t border-slate-200">{credentialsSection}</div>
        </>
      ) : (
        <>
          {credentialsSection}
          <div className="pt-4 border-t border-slate-200">{enrollmentsSection}</div>
        </>
      )}

      {/* SECTION C: Internship Applications & Sprint Submissions */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Internship Applications &amp; Sprint Submissions ({userApps.length})
            </h2>
            <p className="text-sm text-slate-600">
              Track your Virtual Cohort sprint repositories and Partner Company applications.
            </p>
          </div>
          <button
            type="button"
            onClick={onSelectInternshipTab}
            className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Open Internship Portal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {userApps.map((app) => {
            const intern = internships.find((i) => i.id === app.internshipId);
            if (!intern) return null;

            const internCreds = userCreds.filter(
              (c) =>
                c.referenceId === intern.id &&
                (c.credentialType === 'internship_offer_letter' ||
                  c.credentialType === 'internship_completion')
            );

            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono-tabular text-slate-500">
                    <span>{intern.companyName}</span>
                    <span className="font-semibold text-indigo-700 uppercase">
                      STATUS: {app.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{intern.title}</h3>
                  {app.githubRepoUrl ? (
                    <div className="text-xs font-mono-tabular text-slate-600 space-y-1">
                      <p>GitHub Repo: {app.githubRepoUrl}</p>
                      <p>Live Deployment: {app.liveDemoUrl}</p>
                      <p className="text-emerald-700 font-semibold">
                        Evaluation Score: {app.evaluationScore}/100
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">
                      Offer Letter active. Submit your Sprint GitHub repository and Live Demo link
                      in the Internship Workspace to unlock your Completion Certificate.
                    </p>
                  )}
                </div>

                {internCreds.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    {internCreds.map((ic) => (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => handleSavePdf(ic)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{getCredentialDownloadLabel(ic.credentialType)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
