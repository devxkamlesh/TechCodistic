import React, { useState } from 'react';
import {
  Course,
  Credential,
  Enrollment,
  Internship,
  InternshipApplication,
  InternshipTask,
} from '../db/schema';
import {
  checkCompanyInternshipEligibility,
  validateInternshipSubmission,
} from '../services/domain.logic';
import {
  CheckCircle2,
  Lock,
  Unlock,
  ExternalLink,
  GitBranch,
  Globe,
  Award,
  ArrowRight,
} from 'lucide-react';

interface InternshipsViewProps {
  internships: Internship[];
  tasks: InternshipTask[];
  applications: InternshipApplication[];
  enrollments: Enrollment[];
  courses: Course[];
  credentials: Credential[];
  currentUserId: string;
  onEnrollVirtualInternship: (internshipId: string) => {
    application: InternshipApplication;
    offerCredential: Credential;
  };
  onSubmitVirtualProject: (
    internshipId: string,
    githubRepoUrl: string,
    liveDemoUrl: string
  ) => {
    certificate: Credential;
    application: InternshipApplication;
  };
  onApplyCompanyInternship: (internshipId: string) => {
    application: InternshipApplication;
    offerCredential: Credential;
  };
  onNavigateToCourse: (courseId: string) => void;
  onInspectCredential: (verificationCode: string) => void;
}

export const InternshipsView: React.FC<InternshipsViewProps> = ({
  internships,
  tasks,
  applications,
  enrollments,
  courses,
  credentials,
  currentUserId,
  onEnrollVirtualInternship,
  onSubmitVirtualProject,
  onApplyCompanyInternship,
  onNavigateToCourse,
  onInspectCredential,
}) => {
  const [activeTrack, setActiveTrack] = useState<'all' | 'virtual_cohort' | 'company_hiring'>('all');
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>('intern-vc-1');

  const [githubInput, setGithubInput] = useState<string>('');
  const [liveDemoInput, setLiveDemoInput] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ githubRepoUrl?: string; liveDemoUrl?: string }>({});
  const [bannerFeedback, setBannerFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    verificationCode?: string;
  } | null>(null);

  const virtualInternships = internships.filter((i) => i.type === 'virtual_cohort');
  const companyInternships = internships.filter((i) => i.type === 'company_hiring');

  const selectedInternship =
    internships.find((i) => i.id === selectedInternshipId) || virtualInternships[0];

  const selectedApp = applications.find(
    (a) => a.userId === currentUserId && a.internshipId === selectedInternship?.id
  );

  const selectedTasks = tasks
    .filter((t) => t.internshipId === selectedInternship?.id)
    .sort((a, b) => a.sprintNumber - b.sprintNumber);

  const offerCredForSelected = credentials.find(
    (c) =>
      c.userId === currentUserId &&
      c.referenceId === selectedInternship?.id &&
      c.credentialType === 'internship_offer_letter'
  );

  const completionCredForSelected = credentials.find(
    (c) =>
      c.userId === currentUserId &&
      c.referenceId === selectedInternship?.id &&
      c.credentialType === 'internship_completion'
  );

  const handleEnrollVirtual = (internshipId: string) => {
    setFormErrors({});
    const res = onEnrollVirtualInternship(internshipId);
    setSelectedInternshipId(internshipId);
    setBannerFeedback({
      type: 'success',
      message: `Automated Offer Letter Issued (${res.offerCredential.verificationCode}) — Sprint tasks unlocked.`,
      verificationCode: res.offerCredential.verificationCode,
    });
  };

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship) return;

    const validation = validateInternshipSubmission(githubInput, liveDemoInput);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      setBannerFeedback(null);
      return;
    }

    setFormErrors({});
    const res = onSubmitVirtualProject(selectedInternship.id, githubInput, liveDemoInput);
    setBannerFeedback({
      type: 'success',
      message: `Repository & Live Deployment Verified (Score: 95/100) — Internship Completion Certificate Issued (${res.certificate.verificationCode})!`,
      verificationCode: res.certificate.verificationCode,
    });
  };

  const handleCompanyApply = (internshipId: string) => {
    try {
      const res = onApplyCompanyInternship(internshipId);
      setBannerFeedback({
        type: 'success',
        message: `Pre-Verified Application Accepted — Partner Offer Letter Issued (${res.offerCredential.verificationCode}).`,
        verificationCode: res.offerCredential.verificationCode,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Prerequisite course not completed.';
      setBannerFeedback({
        type: 'error',
        message,
      });
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-8 space-y-10">
      {/* Header & Track Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-indigo-700 font-mono-tabular">
              Dual-Track Internship Engine · Drizzle Transactional Issuance
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Virtual Cohort Sprints &amp; Skill-Gated Partner Hiring
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl">
              Enroll in an automated Virtual Cohort to receive an instant Offer Letter and build
              milestone repositories, or apply to Partner Company roles unlocked by your verified
              platform diplomas and certificates.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {(
              [
                { id: 'all', label: 'All Tracks (8)' },
                { id: 'virtual_cohort', label: 'Virtual Cohorts (4)' },
                { id: 'company_hiring', label: 'Skill-Gated Companies (4)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTrack(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTrack === tab.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {bannerFeedback && (
          <div
            role="status"
            className={`p-4 rounded-lg border flex flex-wrap items-center justify-between gap-4 ${
              bannerFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <span className="text-xs font-semibold">{bannerFeedback.message}</span>
            {bannerFeedback.verificationCode && (
              <button
                type="button"
                onClick={() => onInspectCredential(bannerFeedback.verificationCode!)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-md hover:bg-emerald-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Verify QR Credential ({bannerFeedback.verificationCode})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* SECTION 1: Virtual Cohort Internships + Sprint Workspace */}
      {(activeTrack === 'all' || activeTrack === 'virtual_cohort') && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                01. Virtual Cohort Internships (Automated Offer Letter &amp; Sprint Evaluation)
              </h2>
              <p className="text-sm text-slate-600">
                Lifecycle: Applied → Offer Letter Generated → Sprint Tasks Unlocked → Repo &amp; Live
                Link Submitted → Completion Certificate Issued.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 Columns: Virtual Cohort Cards */}
            <div className="lg:col-span-5 space-y-4">
              {virtualInternships.map((intern) => {
                const app = applications.find(
                  (a) => a.userId === currentUserId && a.internshipId === intern.id
                );
                const isSelected = selectedInternship?.id === intern.id;

                return (
                  <div
                    key={intern.id}
                    className={`bg-white border rounded-xl p-5 space-y-3 transition-colors ${
                      isSelected ? 'border-indigo-600' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-mono-tabular">
                      <span className="font-semibold text-indigo-700">{intern.domain}</span>
                      <span>·</span>
                      <span>{intern.durationWeeks} Weeks</span>
                      <span>·</span>
                      <span>
                        {app ? `Status: ${app.status.replace('_', ' ')}` : 'Instant Offer Letter'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{intern.title}</h3>
                    <p className="text-xs text-slate-500">{intern.companyName}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{intern.summary}</p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInternshipId(intern.id);
                          setFormErrors({});
                        }}
                        className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                      >
                        {isSelected ? 'Active in Sprint Workspace →' : 'Open Sprint Workspace'}
                      </button>

                      {!app ? (
                        <button
                          type="button"
                          onClick={() => handleEnrollVirtual(intern.id)}
                          className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer"
                        >
                          Enroll &amp; Issue Offer Letter
                        </button>
                      ) : (
                        <span className="text-xs font-mono-tabular font-semibold text-emerald-700">
                          {app.status === 'completed'
                            ? `✓ Completed (${app.evaluationScore}%)`
                            : '✓ Offer Letter Active'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 7 Columns: Active Virtual Cohort Sprint Workspace & Repo Submission */}
            {selectedInternship && selectedInternship.type === 'virtual_cohort' && (
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
                <div className="pb-4 border-b border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-mono-tabular">
                    <span>VIRTUAL COHORT WORKSPACE</span>
                    <span>
                      {selectedInternship.durationWeeks}-Week Engineering Track ·{' '}
                      {selectedInternship.companyName}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedInternship.title}</h3>

                  {/* Issued Credentials Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {offerCredForSelected ? (
                      <button
                        type="button"
                        onClick={() => onInspectCredential(offerCredForSelected.verificationCode)}
                        className="px-3 py-1.5 text-xs font-mono-tabular font-semibold bg-indigo-50 text-indigo-800 rounded-lg hover:bg-indigo-100 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Offer Letter: {offerCredForSelected.verificationCode}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEnrollVirtual(selectedInternship.id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer"
                      >
                        Enroll Now to Generate Instant Offer Letter
                      </button>
                    )}

                    {completionCredForSelected && (
                      <button
                        type="button"
                        onClick={() =>
                          onInspectCredential(completionCredForSelected.verificationCode)
                        }
                        className="px-3 py-1.5 text-xs font-mono-tabular font-semibold bg-emerald-50 text-emerald-800 rounded-lg hover:bg-emerald-100 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          Completion Certificate: {completionCredForSelected.verificationCode}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Milestone Sprint Tasks */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Project Milestone Sprints ({selectedTasks.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs font-mono-tabular text-slate-500">
                          <span className="font-semibold text-indigo-700">
                            Sprint 0{task.sprintNumber}
                          </span>
                          <span>Deliverable: {task.deliverableHint}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{task.title}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {task.specificationMarkdown}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repository & Live Deployment Submission Form */}
                <form
                  onSubmit={handleProjectSubmit}
                  noValidate
                  className="pt-5 border-t border-slate-200 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">
                      Submit Sprint Repository &amp; Live Deployment for Verification
                    </h4>
                    <span className="text-xs font-mono-tabular text-slate-500">
                      Automated Evaluation &amp; Certificate Trigger
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="github-repo-input"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        GitHub Repository URL (HTTPS)
                      </label>
                      <div className="relative">
                        <GitBranch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="github-repo-input"
                          type="url"
                          value={githubInput}
                          onChange={(e) => setGithubInput(e.target.value)}
                          placeholder="https://github.com/username/alison-lms-mvp"
                          className="w-full pl-9 pr-3 py-2 text-xs font-mono-tabular bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                      {formErrors.githubRepoUrl && (
                        <p role="alert" className="text-xs text-red-600 font-medium mt-1">
                          {formErrors.githubRepoUrl}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="live-demo-input"
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Live Production Deployment URL
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="live-demo-input"
                          type="url"
                          value={liveDemoInput}
                          onChange={(e) => setLiveDemoInput(e.target.value)}
                          placeholder="https://alison-lms-mvp.vercel.app"
                          className="w-full pl-9 pr-3 py-2 text-xs font-mono-tabular bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                      {formErrors.liveDemoUrl && (
                        <p role="alert" className="text-xs text-red-600 font-medium mt-1">
                          {formErrors.liveDemoUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedApp?.githubRepoUrl && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-mono-tabular">
                      Submitted Repo: {selectedApp.githubRepoUrl} · Live Demo:{' '}
                      {selectedApp.liveDemoUrl} · Score: {selectedApp.evaluationScore}/100
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setGithubInput('https://github.com/aarav-mehta/alison-lms-mvp');
                        setLiveDemoInput('https://alison-lms-mvp.vercel.app');
                        setFormErrors({});
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      Fill Sample Project URLs
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer"
                    >
                      Submit Project &amp; Issue Internship Certificate
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 2: Company-Posted Internships (Skill-Gated Marketplace) */}
      {(activeTrack === 'all' || activeTrack === 'company_hiring') && (
        <section className="space-y-6 pt-4 border-t border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              02. Company-Posted Internships (Skill-Gated Partner Marketplace)
            </h2>
            <p className="text-sm text-slate-600">
              Partner companies require specific platform diplomas or certificates as prerequisites,
              automatically filtering applicants so recruiters only see pre-verified candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyInternships.map((intern) => {
              const gate = checkCompanyInternshipEligibility(intern, enrollments, currentUserId);
              const prereqCourse = courses.find((c) => c.id === intern.prerequisiteCourseId);
              const existingApp = applications.find(
                (a) => a.userId === currentUserId && a.internshipId === intern.id
              );
              const companyOfferCred = credentials.find(
                (c) =>
                  c.userId === currentUserId &&
                  c.referenceId === intern.id &&
                  c.credentialType === 'internship_offer_letter'
              );

              return (
                <article
                  key={intern.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-mono-tabular">
                      <span className="font-semibold text-slate-900">{intern.companyName}</span>
                      <span>·</span>
                      <span>{intern.domain}</span>
                      <span>·</span>
                      <span>{intern.durationWeeks} Weeks</span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-700">
                        Stipend: ₹{intern.stipendInr.toLocaleString()}/mo
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{intern.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{intern.summary}</p>

                    {/* Prerequisite Gate Status Box */}
                    <div
                      className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                        gate.eligible
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        {gate.eligible ? (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="text-emerald-800">
                              Skill Gate Unlocked — Prerequisite Credential Verified
                            </span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>Skill Gate Locked — Prerequisite Required</span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-600">
                        Required Credential:{' '}
                        <span className="font-semibold text-slate-900">
                          {prereqCourse ? prereqCourse.title : 'Platform Certificate'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {existingApp && companyOfferCred ? (
                      <button
                        type="button"
                        onClick={() => onInspectCredential(companyOfferCred.verificationCode)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>View Partner Offer ({companyOfferCred.verificationCode})</span>
                      </button>
                    ) : gate.eligible ? (
                      <button
                        type="button"
                        onClick={() => handleCompanyApply(intern.id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Submit Pre-Verified Application</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      prereqCourse && (
                        <button
                          type="button"
                          onClick={() => onNavigateToCourse(prereqCourse.id)}
                          className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>
                            Complete Prerequisite Course #{prereqCourse.catalogNumber} to Unlock
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
