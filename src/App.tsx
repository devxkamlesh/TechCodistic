/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar, NavSection } from './components/Navbar';
import { CatalogView } from './components/CatalogView';
import { CourseLearnView } from './components/CourseLearnView';
import { InternshipsView } from './components/InternshipsView';
import { CredentialsView } from './components/CredentialsView';
import { VerifyCredentialView } from './components/VerifyCredentialView';
import {
  applyToCompanyInternshipService,
  enrollInCourseService,
  enrollInVirtualInternshipService,
  loadPlatformState,
  markLessonCompletedService,
  resetPlatformStateToSeed,
  submitAndVerifyInternshipProjectService,
  submitCourseAssessmentService,
} from './services/platform.service';
import { PlatformState } from './db/schema';

export default function App() {
  const [state, setState] = useState<PlatformState>(() => loadPlatformState());
  const [activeSection, setActiveSection] = useState<NavSection>('catalog');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState<string>('DIP-2026-4B19E82A');

  const handleNavigateSection = (section: NavSection) => {
    setActiveCourseId(null);
    setActiveSection(section);
    window.scrollTo(0, 0);
  };

  const handleOpenCourse = (courseId: string) => {
    const { nextState } = enrollInCourseService(state, courseId);
    setState(nextState);
    setActiveCourseId(courseId);
    window.scrollTo(0, 0);
  };

  const handleMarkLessonComplete = (courseId: string, lessonId: string) => {
    const nextState = markLessonCompletedService(state, courseId, lessonId);
    setState(nextState);
  };

  const handleSubmitCourseAssessment = (
    courseId: string,
    selectedAnswers: Record<string, number>
  ) => {
    const res = submitCourseAssessmentService(state, courseId, selectedAnswers);
    setState(res.nextState);
    return {
      scorePercent: res.scorePercent,
      passed: res.passed,
      issuedCredential: res.issuedCredential,
    };
  };

  const handleEnrollVirtualInternship = (internshipId: string) => {
    const res = enrollInVirtualInternshipService(state, internshipId);
    setState(res.nextState);
    return {
      application: res.application,
      offerCredential: res.offerCredential,
    };
  };

  const handleSubmitVirtualProject = (
    internshipId: string,
    githubRepoUrl: string,
    liveDemoUrl: string
  ) => {
    const res = submitAndVerifyInternshipProjectService(
      state,
      internshipId,
      githubRepoUrl,
      liveDemoUrl
    );
    setState(res.nextState);
    return {
      certificate: res.certificate,
      application: res.application,
    };
  };

  const handleApplyCompanyInternship = (internshipId: string) => {
    const res = applyToCompanyInternshipService(state, internshipId);
    setState(res.nextState);
    return {
      application: res.application,
      offerCredential: res.offerCredential,
    };
  };

  const handleInspectCredential = (code: string) => {
    setVerifyCode(code);
    setActiveCourseId(null);
    setActiveSection('verify');
    window.scrollTo(0, 0);
  };

  const handleResetDemoData = () => {
    const fresh = resetPlatformStateToSeed();
    setState(fresh);
    setVerifyCode('DIP-2026-4B19E82A');
  };

  const selectedCourse = activeCourseId
    ? state.courses.find((c) => c.id === activeCourseId)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigateSection}
        onQuickVerifyClick={() => handleInspectCredential(state.credentials[0]?.verificationCode || 'DIP-2026-4B19E82A')}
      />

      <main className="flex-1 pb-16">
        {selectedCourse ? (
          <CourseLearnView
            course={selectedCourse}
            lessons={state.lessonsByCourseId[selectedCourse.id] || []}
            questions={state.questionsByCourseId[selectedCourse.id] || []}
            enrollment={state.enrollments.find(
              (e) => e.userId === state.currentUser.id && e.courseId === selectedCourse.id
            )}
            existingCredential={state.credentials.find(
              (c) =>
                c.userId === state.currentUser.id &&
                c.referenceId === selectedCourse.id &&
                (c.credentialType === 'course_certificate' || c.credentialType === 'course_diploma')
            )}
            onBackToCatalog={() => setActiveCourseId(null)}
            onMarkLessonComplete={handleMarkLessonComplete}
            onSubmitAssessment={handleSubmitCourseAssessment}
            onInspectCredential={handleInspectCredential}
          />
        ) : activeSection === 'catalog' ? (
          <CatalogView
            courses={state.courses}
            enrollments={state.enrollments}
            currentUserId={state.currentUser.id}
            onSelectCourse={handleOpenCourse}
            onExploreInternships={() => handleNavigateSection('internships')}
          />
        ) : activeSection === 'internships' ? (
          <InternshipsView
            internships={state.internships}
            tasks={state.internshipTasks}
            applications={state.internshipApplications}
            enrollments={state.enrollments}
            courses={state.courses}
            credentials={state.credentials}
            currentUserId={state.currentUser.id}
            onEnrollVirtualInternship={handleEnrollVirtualInternship}
            onSubmitVirtualProject={handleSubmitVirtualProject}
            onApplyCompanyInternship={handleApplyCompanyInternship}
            onNavigateToCourse={handleOpenCourse}
            onInspectCredential={handleInspectCredential}
          />
        ) : activeSection === 'learning' || activeSection === 'credentials' ? (
          <CredentialsView
            mode={activeSection}
            user={state.currentUser}
            courses={state.courses}
            enrollments={state.enrollments}
            internships={state.internships}
            applications={state.internshipApplications}
            credentials={state.credentials}
            onSelectCourse={handleOpenCourse}
            onSelectInternshipTab={() => handleNavigateSection('internships')}
            onInspectCredential={handleInspectCredential}
            onResetDemoData={handleResetDemoData}
          />
        ) : (
          <VerifyCredentialView
            initialCode={verifyCode}
            credentials={state.credentials}
            onSelectCode={setVerifyCode}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-[1360px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            TechCodistic (techcodistic.com) — Unified Learning Management System &amp; Dual-Track
            Internship Verification Engine
          </p>
          <div className="flex items-center gap-5">
            <a
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateSection('catalog');
              }}
              className="hover:text-slate-900 transition-colors"
            >
              50-Course Catalog
            </a>
            <a
              href="#internships"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateSection('internships');
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Dual-Track Internships
            </a>
            <a
              href="#verify"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateSection('verify');
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Public QR Verifier
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
