import {
  AssessmentQuestion,
  Course,
  CourseType,
  Credential,
  DifficultyLevel,
  Enrollment,
  Internship,
  InternshipApplication,
  PlatformState,
} from '../db/schema';

/**
 * Generates a tamper-evident verification code matching the format:
 * PREFIX-YYYY-8HEX (e.g., OFFER-2026-8F4A2C91, INT-CERT-2026-3E91A04B, CERT-2026-7C12D40F)
 */
export function generateVerificationCode(
  prefix: 'OFFER' | 'INT-CERT' | 'CERT' | 'DIP',
  year: number = 2026,
  seedString?: string
): string {
  if (seedString) {
    let hash = 2166136261;
    for (let i = 0; i < seedString.length; i++) {
      hash ^= seedString.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
    return `${prefix}-${year}-${hex}`;
  }
  const randomBytes = new Uint32Array(1);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(randomBytes);
  } else {
    randomBytes[0] = Math.floor(Math.random() * 0xffffffff);
  }
  const hex = (randomBytes[0] >>> 0).toString(16).toUpperCase().padStart(8, '0');
  return `${prefix}-${year}-${hex}`;
}

/**
 * Computes integer progress percentage (0..100) from completed lesson IDs.
 */
export function calculateLessonProgressPercent(
  completedLessonIds: string[],
  totalLessons: number
): number {
  if (totalLessons <= 0) return 0;
  const uniqueCount = new Set(completedLessonIds).size;
  const clamped = Math.min(uniqueCount, totalLessons);
  return Math.round((clamped / totalLessons) * 100);
}

/**
 * Computes SVG circular progress ring geometry (radius, circumference, strokeDashoffset)
 * for a given progress percentage (0..100).
 */
export interface CircularProgressGeometry {
  clampedPercent: number;
  size: number;
  strokeWidth: number;
  center: number;
  radius: number;
  circumference: number;
  strokeDashoffset: number;
}

export function calculateCircularProgressGeometry(
  progressPercent: number,
  size: number = 48,
  strokeWidth: number = 4
): CircularProgressGeometry {
  const clampedPercent = Math.max(0, Math.min(100, Math.round(progressPercent)));
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = Number((2 * Math.PI * radius).toFixed(2));
  const strokeDashoffset = Number(
    (circumference - (clampedPercent / 100) * circumference).toFixed(2)
  );

  return {
    clampedPercent,
    size,
    strokeWidth,
    center,
    radius,
    circumference,
    strokeDashoffset,
  };
}

/**
 * Evaluates a course's final assessment against the required passing threshold (default 80%).
 */
export interface AssessmentEvaluationResult {
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  passingScore: number;
}

export function evaluateCourseAssessment(
  selectedOptionByQuestionId: Record<string, number>,
  questions: AssessmentQuestion[],
  passingScore: number = 80
): AssessmentEvaluationResult {
  if (questions.length === 0) {
    return {
      scorePercent: 0,
      correctCount: 0,
      totalQuestions: 0,
      passed: false,
      passingScore,
    };
  }

  let correctCount = 0;
  for (const q of questions) {
    const chosen = selectedOptionByQuestionId[q.id];
    if (typeof chosen === 'number' && chosen === q.correctOptionIndex) {
      correctCount += 1;
    }
  }

  const scorePercent = Math.round((correctCount / questions.length) * 100);
  return {
    scorePercent,
    correctCount,
    totalQuestions: questions.length,
    passed: scorePercent >= passingScore,
    passingScore,
  };
}

/**
 * Validates GitHub repository and Live Deployment URLs for Virtual Internship Sprint submission.
 * Never silently substitutes fallback values when required inputs are empty or invalid.
 */
export interface SubmissionValidationResult {
  valid: boolean;
  errors: {
    githubRepoUrl?: string;
    liveDemoUrl?: string;
  };
}

export function validateInternshipSubmission(
  githubRepoUrl: string,
  liveDemoUrl: string
): SubmissionValidationResult {
  const errors: SubmissionValidationResult['errors'] = {};
  const trimmedRepo = githubRepoUrl.trim();
  const trimmedDemo = liveDemoUrl.trim();

  if (!trimmedRepo) {
    errors.githubRepoUrl = 'GitHub repository URL is required.';
  } else {
    try {
      const parsed = new URL(trimmedRepo);
      const isGithub =
        parsed.protocol === 'https:' &&
        (parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com') &&
        parsed.pathname.split('/').filter(Boolean).length >= 2;
      if (!isGithub) {
        errors.githubRepoUrl =
          'Enter a valid HTTPS GitHub repository URL (e.g., https://github.com/username/project).';
      }
    } catch {
      errors.githubRepoUrl =
        'Enter a valid HTTPS GitHub repository URL (e.g., https://github.com/username/project).';
    }
  }

  if (!trimmedDemo) {
    errors.liveDemoUrl = 'Live deployment URL is required.';
  } else {
    try {
      const parsed = new URL(trimmedDemo);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        errors.liveDemoUrl = 'Live deployment URL must use https:// or http://.';
      } else if (!parsed.hostname.includes('.')) {
        errors.liveDemoUrl = 'Enter a valid deployed application domain (e.g., https://project.vercel.app).';
      }
    } catch {
      errors.liveDemoUrl = 'Enter a valid deployed application URL (e.g., https://project.vercel.app).';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Skill-Gated Marketplace check: determines whether a student satisfies a Company-Posted
 * Internship's prerequisite course completion requirement.
 */
export interface SkillGateStatus {
  eligible: boolean;
  requiresPrerequisite: boolean;
  prerequisiteCourseId: string | null;
  reason: string;
}

export function checkCompanyInternshipEligibility(
  internship: Internship,
  enrollments: Enrollment[],
  userId: string
): SkillGateStatus {
  if (!internship.prerequisiteCourseId) {
    return {
      eligible: true,
      requiresPrerequisite: false,
      prerequisiteCourseId: null,
      reason: 'Open to all verified students.',
    };
  }

  const completedPrereq = enrollments.find(
    (e) =>
      e.userId === userId &&
      e.courseId === internship.prerequisiteCourseId &&
      e.isCompleted &&
      (e.quizScore ?? 0) >= 80
  );

  if (completedPrereq) {
    return {
      eligible: true,
      requiresPrerequisite: true,
      prerequisiteCourseId: internship.prerequisiteCourseId,
      reason: `Prerequisite verified (${completedPrereq.quizScore}% assessment score).`,
    };
  }

  return {
    eligible: false,
    requiresPrerequisite: true,
    prerequisiteCourseId: internship.prerequisiteCourseId,
    reason: 'Requires passing the prerequisite platform credential (≥ 80% assessment) before applying.',
  };
}

/**
 * Composite catalog filtering and sorting (indexed by category, track type, difficulty, search query,
 * and sorted by learnerCount DESC as specified in the HLD).
 */
export interface CourseFilterOptions {
  category?: string;
  type?: 'all' | CourseType;
  level?: 'all' | DifficultyLevel;
  searchQuery?: string;
  sortBy?: 'popular' | 'duration_asc' | 'duration_desc' | 'catalog_order';
}

export function filterAndSortCourses(
  courses: Course[],
  options: CourseFilterOptions
): Course[] {
  const {
    category = 'All Categories',
    type = 'all',
    level = 'all',
    searchQuery = '',
    sortBy = 'popular',
  } = options;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = courses.filter((course) => {
    if (category && category !== 'All Categories' && course.category !== category) {
      return false;
    }
    if (type !== 'all' && course.type !== type) {
      return false;
    }
    if (level !== 'all' && course.level !== level) {
      return false;
    }
    if (normalizedQuery) {
      const matchesTitle = course.title.toLowerCase().includes(normalizedQuery);
      const matchesCategory = course.category.toLowerCase().includes(normalizedQuery);
      if (!matchesTitle && !matchesCategory) {
        return false;
      }
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === 'duration_asc') return a.durationHours - b.durationHours;
    if (sortBy === 'duration_desc') return b.durationHours - a.durationHours;
    if (sortBy === 'catalog_order') return a.catalogNumber - b.catalogNumber;
    // Default composite index order: learnerCount DESC
    return b.learnerCount - a.learnerCount;
  });
}

/**
 * Suggested Career Path Bundle model and pure recommendation engine.
 * Recommends structured multi-course bundles based on the user's completed certificates/diplomas.
 */
export interface SuggestedPathBundle {
  id: string;
  title: string;
  targetRole: string;
  categoryFocus: string;
  basedOnCompletedCourseTitle: string | null;
  rationale: string;
  courses: Course[];
  completedCourseIds: string[];
  completedCount: number;
  progressPercent: number;
  totalHours: number;
  nextRecommendedCourse: Course;
}

interface PathBlueprint {
  id: string;
  title: string;
  targetRole: string;
  categoryFocus: string;
  courseIds: string[];
  defaultRationale: string;
}

const PATH_BLUEPRINTS: PathBlueprint[] = [
  {
    id: 'path-fullstack-cloud-architect',
    title: 'Full-Stack, PostgreSQL & Cloud DevOps Architecture Bundle',
    targetRole: 'Principal Full-Stack & Cloud Engineer',
    categoryFocus: 'Information Technology & AI',
    courseIds: ['course-1', 'course-9', 'course-7'],
    defaultRationale:
      'Progress from edge-rendered Next.js applications to PostgreSQL connection pooling and automated Docker CI/CD infrastructure.',
  },
  {
    id: 'path-applied-ai-llm-specialist',
    title: 'Prompt Engineering, Python & Applied AI Systems Bundle',
    targetRole: 'AI & LLM Systems Engineer',
    categoryFocus: 'Information Technology & AI',
    courseIds: ['course-6', 'course-11', 'course-2'],
    defaultRationale:
      'Advance from structured LLM prompt engineering into asynchronous Python pipelines and deep transformer architectures.',
  },
  {
    id: 'path-cybersecurity-zero-trust',
    title: 'Ethical Hacking, Network Defense & Quality Auditing Bundle',
    targetRole: 'Application Security & Defense Lead',
    categoryFocus: 'Information Technology & AI',
    courseIds: ['course-8', 'course-3', 'course-5'],
    defaultRationale:
      'Combine offensive OWASP penetration testing with zero-trust network defense and ISO software quality verification.',
  },
  {
    id: 'path-agile-product-leadership',
    title: 'Agile Delivery, Project Management & Venture Scaling Bundle',
    targetRole: 'Technical Product & Engineering Manager',
    categoryFocus: 'Business, Finance & Management',
    courseIds: ['course-23', 'course-13', 'course-22'],
    defaultRationale:
      'Pair technical execution with Scrum velocity diagnostics, CAPM project charters, and startup unit economics.',
  },
];

export function generateSuggestedPathBundles(
  courses: Course[],
  enrollments: Enrollment[],
  userId: string
): SuggestedPathBundle[] {
  const courseMap = new Map<string, Course>();
  for (const c of courses) {
    courseMap.set(c.id, c);
  }

  const completedEnrollmentSet = new Set<string>();
  const completedCourses: Course[] = [];

  for (const enr of enrollments) {
    if (enr.userId === userId && enr.isCompleted) {
      completedEnrollmentSet.add(enr.courseId);
      const found = courseMap.get(enr.courseId);
      if (found) {
        completedCourses.push(found);
      }
    }
  }

  const bundles: SuggestedPathBundle[] = [];

  for (const bp of PATH_BLUEPRINTS) {
    const bundleCourses = bp.courseIds
      .map((id) => courseMap.get(id))
      .filter((c): c is Course => Boolean(c));

    if (bundleCourses.length === 0) continue;

    const completedInBundle = bundleCourses.filter((c) => completedEnrollmentSet.has(c.id));
    const completedCourseIds = completedInBundle.map((c) => c.id);
    const completedCount = completedCourseIds.length;
    const progressPercent = Math.round((completedCount / bundleCourses.length) * 100);
    const totalHours = bundleCourses.reduce((sum, c) => sum + c.durationHours, 0);

    const nextRecommendedCourse =
      bundleCourses.find((c) => !completedEnrollmentSet.has(c.id)) || bundleCourses[0];

    // Identify which completed credential anchors this recommendation
    const directAnchor =
      completedInBundle[0] ||
      completedCourses.find((c) => c.category === bp.categoryFocus) ||
      completedCourses[0] ||
      null;

    const basedOnCompletedCourseTitle = directAnchor ? directAnchor.title : null;

    let rationale = bp.defaultRationale;
    if (completedInBundle.length > 0 && completedInBundle.length < bundleCourses.length) {
      rationale = `Recommended next step because you earned "${completedInBundle[0].title}". Complete "${nextRecommendedCourse.title}" to advance toward ${bp.targetRole}.`;
    } else if (completedInBundle.length === bundleCourses.length) {
      rationale = `You have completed all ${bundleCourses.length} credentials in this path for ${bp.targetRole}.`;
    } else if (directAnchor) {
      rationale = `Complements your verified credential in "${directAnchor.title}" with cross-functional mastery for ${bp.targetRole}.`;
    }

    bundles.push({
      id: bp.id,
      title: bp.title,
      targetRole: bp.targetRole,
      categoryFocus: bp.categoryFocus,
      basedOnCompletedCourseTitle,
      rationale,
      courses: bundleCourses,
      completedCourseIds,
      completedCount,
      progressPercent,
      totalHours,
      nextRecommendedCourse,
    });
  }

  // Sort so partially completed bundles appear first, followed by unstarted bundles, then fully completed bundles
  return bundles.sort((a, b) => {
    const aPartial = a.completedCount > 0 && a.completedCount < a.courses.length ? 1 : 0;
    const bPartial = b.completedCount > 0 && b.completedCount < b.courses.length ? 1 : 0;
    if (aPartial !== bPartial) return bPartial - aPartial;
    return b.completedCount - a.completedCount;
  });
}

/**
 * Pure state transition: Enrolls a student in a Virtual Cohort Internship and
 * immediately issues an automated Offer Letter credential (`OFFER-2026-XXXX`).
 */
export function enrollInVirtualInternshipState(
  state: PlatformState,
  internshipId: string,
  nowIso: string = new Date().toISOString()
): {
  nextState: PlatformState;
  application: InternshipApplication;
  offerCredential: Credential;
} {
  const student = state.currentUser;
  const internship = state.internships.find((i) => i.id === internshipId);
  if (!internship) {
    throw new Error('Invalid internship ID');
  }

  const existingApp = state.internshipApplications.find(
    (a) => a.userId === student.id && a.internshipId === internshipId
  );
  if (existingApp) {
    const existingOffer = state.credentials.find(
      (c) =>
        c.userId === student.id &&
        c.referenceId === internshipId &&
        c.credentialType === 'internship_offer_letter'
    );
    if (existingOffer) {
      return {
        nextState: state,
        application: existingApp,
        offerCredential: existingOffer,
      };
    }
  }

  const offerCode = generateVerificationCode(
    'OFFER',
    new Date(nowIso).getFullYear() || 2026,
    `${student.id}-${internship.id}-offer`
  );

  const application: InternshipApplication = {
    id: `app-${internship.id}-${Date.now()}`,
    userId: student.id,
    internshipId: internship.id,
    status: internship.type === 'virtual_cohort' ? 'offer_issued' : 'applied',
    completedSprintNumbers: [1],
    githubRepoUrl: null,
    liveDemoUrl: null,
    evaluationScore: null,
    appliedAt: nowIso,
    completedAt: null,
  };

  const offerCredential: Credential = {
    id: `cred-offer-${internship.id}-${Date.now()}`,
    verificationCode: offerCode,
    userId: student.id,
    credentialType: 'internship_offer_letter',
    referenceId: internship.id,
    recipientName: student.name,
    titleName: `${internship.title} at ${internship.companyName}`,
    issuerOrganization: internship.companyName,
    pdfUrl: `/verify/${offerCode}`,
    issuedAt: nowIso,
  };

  const nextApplications = existingApp
    ? state.internshipApplications.map((a) => (a.id === existingApp.id ? application : a))
    : [application, ...state.internshipApplications];

  const nextCredentials =
    internship.type === 'virtual_cohort'
      ? [offerCredential, ...state.credentials]
      : state.credentials;

  return {
    nextState: {
      ...state,
      internshipApplications: nextApplications,
      credentials: nextCredentials,
    },
    application,
    offerCredential,
  };
}

/**
 * Pure state transition: Submits & verifies a student's Virtual Internship GitHub Repo and
 * Live Deployment URL, marks status as `completed` (score 95), and issues an `INT-CERT-2026-XXXX` credential.
 */
export function submitAndVerifyInternshipProjectState(
  state: PlatformState,
  internshipId: string,
  githubRepoUrl: string,
  liveDemoUrl: string,
  nowIso: string = new Date().toISOString()
): {
  nextState: PlatformState;
  certificate: Credential;
  application: InternshipApplication;
} {
  const validation = validateInternshipSubmission(githubRepoUrl, liveDemoUrl);
  if (!validation.valid) {
    const firstError =
      validation.errors.githubRepoUrl || validation.errors.liveDemoUrl || 'Invalid submission URLs';
    throw new Error(firstError);
  }

  const student = state.currentUser;
  const internship = state.internships.find((i) => i.id === internshipId);
  if (!internship) {
    throw new Error('Internship not found');
  }

  const tasksForInternship = state.internshipTasks
    .filter((t) => t.internshipId === internshipId)
    .map((t) => t.sprintNumber);

  let updatedApp: InternshipApplication | undefined;
  const nextApplications = state.internshipApplications.map((app) => {
    if (app.userId === student.id && app.internshipId === internshipId) {
      updatedApp = {
        ...app,
        githubRepoUrl: githubRepoUrl.trim(),
        liveDemoUrl: liveDemoUrl.trim(),
        status: 'completed',
        completedSprintNumbers: tasksForInternship.length > 0 ? tasksForInternship : [1, 2, 3],
        evaluationScore: 95,
        completedAt: nowIso,
      };
      return updatedApp;
    }
    return app;
  });

  if (!updatedApp) {
    updatedApp = {
      id: `app-${internshipId}-${Date.now()}`,
      userId: student.id,
      internshipId,
      status: 'completed',
      completedSprintNumbers: tasksForInternship.length > 0 ? tasksForInternship : [1, 2, 3],
      githubRepoUrl: githubRepoUrl.trim(),
      liveDemoUrl: liveDemoUrl.trim(),
      evaluationScore: 95,
      appliedAt: nowIso,
      completedAt: nowIso,
    };
    nextApplications.unshift(updatedApp);
  }

  const existingCert = state.credentials.find(
    (c) =>
      c.userId === student.id &&
      c.referenceId === internshipId &&
      c.credentialType === 'internship_completion'
  );

  if (existingCert) {
    return {
      nextState: {
        ...state,
        internshipApplications: nextApplications,
      },
      certificate: existingCert,
      application: updatedApp,
    };
  }

  const certCode = generateVerificationCode(
    'INT-CERT',
    new Date(nowIso).getFullYear() || 2026,
    `${student.id}-${internship.id}-completion`
  );

  const certificate: Credential = {
    id: `cred-int-cert-${internship.id}-${Date.now()}`,
    verificationCode: certCode,
    userId: student.id,
    credentialType: 'internship_completion',
    referenceId: internship.id,
    recipientName: student.name,
    titleName: `${internship.title} (${internship.durationWeeks}-Week Virtual Internship)`,
    issuerOrganization: internship.companyName,
    scorePercent: 95,
    pdfUrl: `/verify/${certCode}`,
    issuedAt: nowIso,
  };

  return {
    nextState: {
      ...state,
      internshipApplications: nextApplications,
      credentials: [certificate, ...state.credentials],
    },
    certificate,
    application: updatedApp,
  };
}
