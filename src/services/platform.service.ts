import {
  Credential,
  Enrollment,
  InternshipApplication,
  PlatformState,
} from '../db/schema';
import { createInitialPlatformState } from '../db/seed';
import {
  calculateLessonProgressPercent,
  checkCompanyInternshipEligibility,
  enrollInVirtualInternshipState,
  evaluateCourseAssessment,
  generateVerificationCode,
  submitAndVerifyInternshipProjectState,
} from './domain.logic';

const STORAGE_KEY = 'techcodistic_lms_platform_state_v2';

export function loadPlatformState(): PlatformState {
  if (typeof window === 'undefined') {
    return createInitialPlatformState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createInitialPlatformState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as PlatformState;
    if (!parsed.courses || parsed.courses.length < 50) {
      const seed = createInitialPlatformState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return createInitialPlatformState();
  }
}

export function savePlatformState(state: PlatformState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

export function resetPlatformStateToSeed(): PlatformState {
  const seed = createInitialPlatformState();
  savePlatformState(seed);
  return seed;
}

/**
 * Course Service: Enrolls student in a course if not already enrolled.
 */
export function enrollInCourseService(
  state: PlatformState,
  courseId: string
): { nextState: PlatformState; enrollment: Enrollment } {
  const existing = state.enrollments.find(
    (e) => e.userId === state.currentUser.id && e.courseId === courseId
  );
  if (existing) {
    return { nextState: state, enrollment: existing };
  }

  const enrollment: Enrollment = {
    id: `enr-${courseId}-${Date.now()}`,
    userId: state.currentUser.id,
    courseId,
    completedLessonIds: [],
    progressPercent: 0,
    quizScore: null,
    isCompleted: false,
    completedAt: null,
  };

  const nextCourses = state.courses.map((c) =>
    c.id === courseId ? { ...c, learnerCount: c.learnerCount + 1 } : c
  );

  const nextState: PlatformState = {
    ...state,
    courses: nextCourses,
    enrollments: [enrollment, ...state.enrollments],
  };

  savePlatformState(nextState);
  return { nextState, enrollment };
}

/**
 * Course Service: Toggles or marks a lesson complete in the Redis-style bitmap tracker
 * and flushes progress to the enrollment record.
 */
export function markLessonCompletedService(
  state: PlatformState,
  courseId: string,
  lessonId: string
): PlatformState {
  const lessons = state.lessonsByCourseId[courseId] || [];
  const totalLessons = lessons.length;

  let foundEnrollment = false;
  const nextEnrollments = state.enrollments.map((enr) => {
    if (enr.userId === state.currentUser.id && enr.courseId === courseId) {
      foundEnrollment = true;
      const set = new Set(enr.completedLessonIds);
      set.add(lessonId);
      const completedLessonIds = Array.from(set);
      const progressPercent = calculateLessonProgressPercent(completedLessonIds, totalLessons);
      return {
        ...enr,
        completedLessonIds,
        progressPercent,
      };
    }
    return enr;
  });

  if (!foundEnrollment) {
    const completedLessonIds = [lessonId];
    const progressPercent = calculateLessonProgressPercent(completedLessonIds, totalLessons);
    nextEnrollments.unshift({
      id: `enr-${courseId}-${Date.now()}`,
      userId: state.currentUser.id,
      courseId,
      completedLessonIds,
      progressPercent,
      quizScore: null,
      isCompleted: false,
      completedAt: null,
    });
  }

  const nextState: PlatformState = {
    ...state,
    enrollments: nextEnrollments,
  };
  savePlatformState(nextState);
  return nextState;
}

/**
 * Certificate & Assessment Service: Grades the final course assessment.
 * When score >= passingScore (80%), marks all lessons complete and issues a verifiable
 * Course Certificate (`CERT-2026-XXXX`) or Diploma (`DIP-2026-XXXX`).
 */
export function submitCourseAssessmentService(
  state: PlatformState,
  courseId: string,
  selectedAnswers: Record<string, number>
): {
  nextState: PlatformState;
  scorePercent: number;
  passed: boolean;
  issuedCredential: Credential | null;
} {
  const course = state.courses.find((c) => c.id === courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  const questions = state.questionsByCourseId[courseId] || [];
  const evaluation = evaluateCourseAssessment(selectedAnswers, questions, course.passingScore);
  const allLessonIds = (state.lessonsByCourseId[courseId] || []).map((l) => l.id);
  const nowIso = new Date().toISOString();

  let enrollmentUpdated = false;
  const nextEnrollments = state.enrollments.map((enr) => {
    if (enr.userId === state.currentUser.id && enr.courseId === courseId) {
      enrollmentUpdated = true;
      return {
        ...enr,
        completedLessonIds: evaluation.passed ? allLessonIds : enr.completedLessonIds,
        progressPercent: evaluation.passed ? 100 : enr.progressPercent,
        quizScore: Math.max(enr.quizScore ?? 0, evaluation.scorePercent),
        isCompleted: enr.isCompleted || evaluation.passed,
        completedAt: evaluation.passed ? enr.completedAt || nowIso : enr.completedAt,
      };
    }
    return enr;
  });

  if (!enrollmentUpdated) {
    nextEnrollments.unshift({
      id: `enr-${courseId}-${Date.now()}`,
      userId: state.currentUser.id,
      courseId,
      completedLessonIds: evaluation.passed ? allLessonIds : [],
      progressPercent: evaluation.passed ? 100 : 0,
      quizScore: evaluation.scorePercent,
      isCompleted: evaluation.passed,
      completedAt: evaluation.passed ? nowIso : null,
    });
  }

  let issuedCredential: Credential | null = null;
  let nextCredentials = state.credentials;

  if (evaluation.passed) {
    const existingCred = state.credentials.find(
      (c) =>
        c.userId === state.currentUser.id &&
        c.referenceId === courseId &&
        (c.credentialType === 'course_certificate' || c.credentialType === 'course_diploma')
    );

    if (existingCred) {
      issuedCredential = existingCred;
    } else {
      const prefix = course.type === 'diploma' ? 'DIP' : 'CERT';
      const code = generateVerificationCode(
        prefix,
        2026,
        `${state.currentUser.id}-${course.id}-passed`
      );
      issuedCredential = {
        id: `cred-course-${course.id}-${Date.now()}`,
        verificationCode: code,
        userId: state.currentUser.id,
        credentialType: course.type === 'diploma' ? 'course_diploma' : 'course_certificate',
        referenceId: course.id,
        recipientName: state.currentUser.name,
        titleName: course.title,
        issuerOrganization: 'TechCodistic Academic Senate',
        scorePercent: evaluation.scorePercent,
        pdfUrl: `/verify/${code}`,
        issuedAt: nowIso,
      };
      nextCredentials = [issuedCredential, ...state.credentials];
    }
  }

  const nextState: PlatformState = {
    ...state,
    enrollments: nextEnrollments,
    credentials: nextCredentials,
  };
  savePlatformState(nextState);

  return {
    nextState,
    scorePercent: evaluation.scorePercent,
    passed: evaluation.passed,
    issuedCredential,
  };
}

/**
 * Internship Service: Enrolls student in a Virtual Cohort Internship and issues instant Offer Letter.
 */
export function enrollInVirtualInternshipService(
  state: PlatformState,
  internshipId: string
): {
  nextState: PlatformState;
  application: InternshipApplication;
  offerCredential: Credential;
} {
  const result = enrollInVirtualInternshipState(state, internshipId);
  savePlatformState(result.nextState);
  return result;
}

/**
 * Internship Service: Submits GitHub Repo & Live Demo URLs, runs evaluation, and issues Completion Certificate.
 */
export function submitAndVerifyInternshipProjectService(
  state: PlatformState,
  internshipId: string,
  githubRepoUrl: string,
  liveDemoUrl: string
): {
  nextState: PlatformState;
  certificate: Credential;
  application: InternshipApplication;
} {
  const result = submitAndVerifyInternshipProjectState(
    state,
    internshipId,
    githubRepoUrl,
    liveDemoUrl
  );
  savePlatformState(result.nextState);
  return result;
}

/**
 * Skill-Gated Company Internship Service: Verifies prerequisite course completion before submitting
 * a pre-verified application to a Partner Company internship.
 */
export function applyToCompanyInternshipService(
  state: PlatformState,
  internshipId: string
): {
  nextState: PlatformState;
  application: InternshipApplication;
  offerCredential: Credential;
} {
  const internship = state.internships.find((i) => i.id === internshipId);
  if (!internship) {
    throw new Error('Internship not found');
  }

  const gate = checkCompanyInternshipEligibility(
    internship,
    state.enrollments,
    state.currentUser.id
  );
  if (!gate.eligible) {
    throw new Error(gate.reason);
  }

  const nowIso = new Date().toISOString();
  const offerCode = generateVerificationCode(
    'OFFER',
    2026,
    `${state.currentUser.id}-${internship.id}-company-offer`
  );

  const application: InternshipApplication = {
    id: `app-co-${internship.id}-${Date.now()}`,
    userId: state.currentUser.id,
    internshipId: internship.id,
    status: 'offer_issued',
    completedSprintNumbers: [],
    githubRepoUrl: null,
    liveDemoUrl: null,
    evaluationScore: 100,
    appliedAt: nowIso,
    completedAt: null,
  };

  const offerCredential: Credential = {
    id: `cred-co-offer-${internship.id}-${Date.now()}`,
    verificationCode: offerCode,
    userId: state.currentUser.id,
    credentialType: 'internship_offer_letter',
    referenceId: internship.id,
    recipientName: state.currentUser.name,
    titleName: `${internship.title} at ${internship.companyName} (Pre-Verified Candidate)`,
    issuerOrganization: internship.companyName,
    pdfUrl: `/verify/${offerCode}`,
    issuedAt: nowIso,
  };

  const filteredApps = state.internshipApplications.filter(
    (a) => !(a.userId === state.currentUser.id && a.internshipId === internshipId)
  );

  const nextState: PlatformState = {
    ...state,
    internshipApplications: [application, ...filteredApps],
    credentials: [offerCredential, ...state.credentials],
  };

  savePlatformState(nextState);
  return { nextState, application, offerCredential };
}
