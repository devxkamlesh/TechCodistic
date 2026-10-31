import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateVerificationCode,
  calculateLessonProgressPercent,
  calculateCircularProgressGeometry,
  evaluateCourseAssessment,
  validateInternshipSubmission,
  checkCompanyInternshipEligibility,
  filterAndSortCourses,
  generateSuggestedPathBundles,
} from './domain.logic';
import {
  buildCredentialPdfString,
  buildQrMatrixForCode,
  createCredentialJsPdf,
  createMultiCredentialJsPdf,
} from './pdf.generator';
import { AssessmentQuestion, Course, Credential, Enrollment, Internship } from '../db/schema';
import { buildCoursesAndContent } from '../db/seed';

test('generateVerificationCode produces deterministic formatted cryptographic ID when seeded', () => {
  const code1 = generateVerificationCode('OFFER', 2026, 'user-1-intern-1');
  const code2 = generateVerificationCode('OFFER', 2026, 'user-1-intern-1');
  assert.equal(code1, code2);
  assert.match(code1, /^OFFER-2026-[0-9A-F]{8}$/);
});

test('calculateLessonProgressPercent computes accurate integer percentage and deduplicates IDs', () => {
  assert.equal(calculateLessonProgressPercent([], 4), 0);
  assert.equal(calculateLessonProgressPercent(['l1', 'l1', 'l2'], 4), 50);
  assert.equal(calculateLessonProgressPercent(['l1', 'l2', 'l3', 'l4'], 4), 100);
});

test('evaluateCourseAssessment enforces >= 80% passing threshold', () => {
  const questions: AssessmentQuestion[] = [
    { id: 'q1', question: 'Q1', options: ['A', 'B'], correctOptionIndex: 0, explanation: '' },
    { id: 'q2', question: 'Q2', options: ['A', 'B'], correctOptionIndex: 1, explanation: '' },
    { id: 'q3', question: 'Q3', options: ['A', 'B'], correctOptionIndex: 0, explanation: '' },
    { id: 'q4', question: 'Q4', options: ['A', 'B'], correctOptionIndex: 1, explanation: '' },
    { id: 'q5', question: 'Q5', options: ['A', 'B'], correctOptionIndex: 0, explanation: '' },
  ];

  // 4/5 = 80% -> PASS
  const passResult = evaluateCourseAssessment(
    { q1: 0, q2: 1, q3: 0, q4: 1, q5: 1 },
    questions,
    80
  );
  assert.equal(passResult.scorePercent, 80);
  assert.equal(passResult.passed, true);

  // 3/5 = 60% -> FAIL
  const failResult = evaluateCourseAssessment(
    { q1: 0, q2: 1, q3: 0, q4: 0, q5: 1 },
    questions,
    80
  );
  assert.equal(failResult.scorePercent, 60);
  assert.equal(failResult.passed, false);
});

test('validateInternshipSubmission rejects empty or invalid URLs and accepts valid GitHub + Demo URLs', () => {
  const emptyCheck = validateInternshipSubmission('', '');
  assert.equal(emptyCheck.valid, false);
  assert.ok(emptyCheck.errors.githubRepoUrl);
  assert.ok(emptyCheck.errors.liveDemoUrl);

  const badGithub = validateInternshipSubmission('https://gitlab.com/user/repo', 'https://app.vercel.app');
  assert.equal(badGithub.valid, false);
  assert.ok(badGithub.errors.githubRepoUrl);

  const validCheck = validateInternshipSubmission(
    'https://github.com/aarav-mehta/alison-lms-mvp',
    'https://alison-lms-mvp.vercel.app'
  );
  assert.equal(validCheck.valid, true);
  assert.equal(Object.keys(validCheck.errors).length, 0);
});

test('checkCompanyInternshipEligibility enforces skill-gated prerequisite completion', () => {
  const companyInternship: Internship = {
    id: 'int-company-1',
    title: 'Full-Stack Next.js Engineer Intern',
    slug: 'fullstack-nextjs-intern',
    companyName: 'Vercel Partner Studio',
    type: 'company_hiring',
    domain: 'Full-Stack Engineering',
    durationWeeks: 12,
    stipendInr: 45000,
    prerequisiteCourseId: 'course-1',
    summary: 'Build edge-cached web applications.',
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  };

  const incompleteEnrollments: Enrollment[] = [
    {
      id: 'enr-1',
      userId: 'u1',
      courseId: 'course-1',
      completedLessonIds: ['l1'],
      progressPercent: 25,
      quizScore: null,
      isCompleted: false,
      completedAt: null,
    },
  ];

  const lockedStatus = checkCompanyInternshipEligibility(companyInternship, incompleteEnrollments, 'u1');
  assert.equal(lockedStatus.eligible, false);
  assert.equal(lockedStatus.requiresPrerequisite, true);

  const completedEnrollments: Enrollment[] = [
    {
      id: 'enr-1',
      userId: 'u1',
      courseId: 'course-1',
      completedLessonIds: ['l1', 'l2', 'l3', 'l4'],
      progressPercent: 100,
      quizScore: 90,
      isCompleted: true,
      completedAt: '2026-02-01T00:00:00Z',
    },
  ];

  const unlockedStatus = checkCompanyInternshipEligibility(companyInternship, completedEnrollments, 'u1');
  assert.equal(unlockedStatus.eligible, true);
});

test('filterAndSortCourses filters by category, type, search query, and sorts by learnerCount DESC', () => {
  const sampleCourses: Course[] = [
    {
      id: 'c1',
      catalogNumber: 1,
      title: 'Diploma in Full-Stack Web Development (Next.js & TypeScript)',
      slug: 'diploma-fullstack-nextjs-typescript',
      category: 'Information Technology & AI',
      type: 'diploma',
      level: 'intermediate',
      durationHours: 24,
      learnerCount: 84200,
      passingScore: 80,
      isPublished: true,
      summary: 'Next.js App Router and Drizzle ORM.',
      outcomes: [],
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'c2',
      catalogNumber: 6,
      title: 'Certificate in Prompt Engineering & LLM Applications',
      slug: 'certificate-prompt-engineering-llm',
      category: 'Information Technology & AI',
      type: 'certificate',
      level: 'beginner',
      durationHours: 8,
      learnerCount: 112500,
      passingScore: 80,
      isPublished: true,
      summary: 'Build production AI workflows.',
      outcomes: [],
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  const sortedPopular = filterAndSortCourses(sampleCourses, { sortBy: 'popular' });
  assert.equal(sortedPopular[0].id, 'c2');
  assert.equal(sortedPopular[1].id, 'c1');

  const onlyDiplomas = filterAndSortCourses(sampleCourses, { type: 'diploma' });
  assert.equal(onlyDiplomas.length, 1);
  assert.equal(onlyDiplomas[0].id, 'c1');

  const byTitleSearch = filterAndSortCourses(sampleCourses, { searchQuery: 'Prompt Engineering' });
  assert.equal(byTitleSearch.length, 1);
  assert.equal(byTitleSearch[0].id, 'c2');

  const byCategorySearch = filterAndSortCourses(sampleCourses, {
    searchQuery: 'information technology',
  });
  assert.equal(byCategorySearch.length, 2);
});

test('generateSuggestedPathBundles prioritizes paths matching completed certificates and identifies logical next course', () => {
  const { courses } = buildCoursesAndContent();

  // Simulate user who completed Course #6 (Prompt Engineering Certificate)
  const enrollments: Enrollment[] = [
    {
      id: 'enr-6',
      userId: 'u1',
      courseId: 'course-6',
      completedLessonIds: ['course-6-lesson-1', 'course-6-lesson-2', 'course-6-lesson-3'],
      progressPercent: 100,
      quizScore: 100,
      isCompleted: true,
      completedAt: '2026-03-01T00:00:00Z',
    },
  ];

  const paths = generateSuggestedPathBundles(courses, enrollments, 'u1');
  assert.ok(paths.length >= 3);

  // Top recommended path should be the Applied AI & LLM bundle since course-6 is in it and partially complete (1/3)
  assert.equal(paths[0].id, 'path-applied-ai-llm-specialist');
  assert.equal(paths[0].completedCount, 1);
  assert.equal(paths[0].nextRecommendedCourse.id, 'course-11');
  assert.ok(
    paths[0].rationale.includes('Certificate in Prompt Engineering & LLM Applications')
  );
});

test('calculateCircularProgressGeometry computes accurate circumference and strokeDashoffset', () => {
  const zeroRing = calculateCircularProgressGeometry(0, 48, 4);
  assert.equal(zeroRing.clampedPercent, 0);
  assert.equal(zeroRing.radius, 22);
  assert.equal(zeroRing.strokeDashoffset, zeroRing.circumference);

  const fullRing = calculateCircularProgressGeometry(100, 48, 4);
  assert.equal(fullRing.clampedPercent, 100);
  assert.equal(fullRing.strokeDashoffset, 0);

  const partialRing = calculateCircularProgressGeometry(50, 48, 4);
  assert.equal(partialRing.clampedPercent, 50);
  assert.ok(partialRing.strokeDashoffset > 0 && partialRing.strokeDashoffset < partialRing.circumference);
});

test('jsPDF credential generator builds valid single and multi-page PDF documents with recipient and verification code', () => {
  const sampleCred1: Credential = {
    id: 'cred-test-1',
    verificationCode: 'DIP-2026-4B19E82A',
    userId: 'u1',
    credentialType: 'course_diploma',
    referenceId: 'course-1',
    recipientName: 'Aarav Mehta',
    titleName: 'Diploma in Full-Stack Web Development (Next.js & TypeScript)',
    issuerOrganization: 'TechCodistic Academic Senate',
    scorePercent: 100,
    pdfUrl: 'https://techcodistic.com/verify/DIP-2026-4B19E82A',
    issuedAt: '2026-02-10T14:30:00.000Z',
  };

  const sampleCred2: Credential = {
    id: 'cred-test-2',
    verificationCode: 'OFFER-2026-8F4A2C91',
    userId: 'u1',
    credentialType: 'internship_offer_letter',
    referenceId: 'intern-1',
    recipientName: 'Aarav Mehta',
    titleName: 'Full-Stack Next.js & Serverless PostgreSQL Cohort',
    issuerOrganization: 'TechCodistic Internship Division',
    scorePercent: null,
    pdfUrl: 'https://techcodistic.com/verify/OFFER-2026-8F4A2C91',
    issuedAt: '2026-02-12T09:15:00.000Z',
  };

  const qrMatrix = buildQrMatrixForCode(sampleCred1.verificationCode);
  assert.equal(qrMatrix.length, 9);
  assert.equal(qrMatrix[0].length, 9);

  const singleDoc = createCredentialJsPdf(sampleCred1);
  assert.equal(singleDoc.getNumberOfPages(), 1);

  const pdf = buildCredentialPdfString(sampleCred1);
  assert.ok(pdf.startsWith('%PDF-1.3'));
  assert.ok(pdf.includes('Aarav Mehta'));
  assert.ok(pdf.includes('DIP-2026-4B19E82A'));
  assert.ok(pdf.includes('TECHCODISTIC'));
  assert.ok(pdf.trimEnd().endsWith('%%EOF'));

  const multiDoc = createMultiCredentialJsPdf([sampleCred1, sampleCred2]);
  assert.equal(multiDoc.getNumberOfPages(), 2);
});
