/**
 * Unified Domain Schema & Drizzle ORM Specification
 * Models the 8 core tables: users, courses, lessons, enrollments,
 * internships, internship_tasks, internship_applications, and credentials.
 */

export type UserRole = 'student' | 'instructor' | 'company' | 'admin';
export type CourseType = 'certificate' | 'diploma';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type InternshipType = 'virtual_cohort' | 'company_hiring';
export type ApplicationStatus =
  | 'applied'
  | 'offer_issued'
  | 'in_progress'
  | 'under_review'
  | 'completed'
  | 'rejected';

export type CredentialType =
  | 'course_certificate'
  | 'course_diploma'
  | 'internship_offer_letter'
  | 'internship_completion';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Course {
  id: string;
  catalogNumber: number;
  title: string;
  slug: string;
  category: string;
  type: CourseType;
  level: DifficultyLevel;
  durationHours: number;
  learnerCount: number;
  passingScore: number;
  isPublished: boolean;
  summary: string;
  outcomes: string[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  sortOrder: number;
  durationMinutes: number;
  videoHlsUrl: string;
  contentMarkdown: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  progressPercent: number;
  quizScore: number | null;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface Internship {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  type: InternshipType;
  domain: string;
  durationWeeks: number;
  stipendInr: number;
  prerequisiteCourseId: string | null;
  summary: string;
  isActive: boolean;
  createdAt: string;
}

export interface InternshipTask {
  id: string;
  internshipId: string;
  sprintNumber: number;
  title: string;
  specificationMarkdown: string;
  deliverableHint: string;
}

export interface InternshipApplication {
  id: string;
  userId: string;
  internshipId: string;
  status: ApplicationStatus;
  completedSprintNumbers: number[];
  githubRepoUrl: string | null;
  liveDemoUrl: string | null;
  evaluationScore: number | null;
  appliedAt: string;
  completedAt: string | null;
}

export interface Credential {
  id: string;
  verificationCode: string;
  userId: string;
  credentialType: CredentialType;
  referenceId: string;
  recipientName: string;
  titleName: string;
  issuerOrganization: string;
  scorePercent?: number;
  pdfUrl: string | null;
  issuedAt: string;
}

export interface PlatformState {
  currentUser: User;
  courses: Course[];
  lessonsByCourseId: Record<string, Lesson[]>;
  questionsByCourseId: Record<string, AssessmentQuestion[]>;
  enrollments: Enrollment[];
  internships: Internship[];
  internshipTasks: InternshipTask[];
  internshipApplications: InternshipApplication[];
  credentials: Credential[];
}

export const COURSE_CATEGORIES = [
  'Information Technology & AI',
  'Business, Finance & Management',
  'Sales, Marketing & Digital Growth',
  'Engineering, Manufacturing & Safety',
  'Health, Food Safety & Hospitality',
  'Academics, Languages & Personal Development',
] as const;

export const DRIZZLE_SCHEMA_SOURCE = `// src/db/schema.ts — Drizzle ORM Schema (PostgreSQL + Next.js App Router)
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('user_role', ['student', 'instructor', 'company', 'admin']);
export const courseTypeEnum = pgEnum('course_type', ['certificate', 'diploma']);
export const levelEnum = pgEnum('difficulty_level', ['beginner', 'intermediate', 'advanced']);
export const internshipTypeEnum = pgEnum('internship_type', ['virtual_cohort', 'company_hiring']);
export const applicationStatusEnum = pgEnum('application_status', [
  'applied',
  'offer_issued',
  'in_progress',
  'under_review',
  'completed',
  'rejected',
]);
export const credentialTypeEnum = pgEnum('credential_type', [
  'course_certificate',
  'course_diploma',
  'internship_offer_letter',
  'internship_completion',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: roleEnum('role').default('student').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    category: text('category').notNull(),
    type: courseTypeEnum('type').default('certificate').notNull(),
    level: levelEnum('level').default('beginner').notNull(),
    durationHours: integer('duration_hours').notNull(),
    learnerCount: integer('learner_count').default(0).notNull(),
    passingScore: integer('passing_score').default(80).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('course_slug_idx').on(table.slug),
    categoryIdx: index('course_category_idx').on(table.category, table.learnerCount),
  })
);

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  sortOrder: integer('sort_order').notNull(),
  videoHlsUrl: text('video_hls_url'),
  contentMarkdown: text('content_markdown'),
});

export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    courseId: uuid('course_id')
      .references(() => courses.id, { onDelete: 'cascade' })
      .notNull(),
    progressPercent: integer('progress_percent').default(0).notNull(),
    quizScore: integer('quiz_score'),
    isCompleted: boolean('is_completed').default(false).notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => ({
    userCourseUnique: uniqueIndex('user_course_unique_idx').on(table.userId, table.courseId),
  })
);

export const internships = pgTable(
  'internships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    companyName: text('company_name').notNull(),
    type: internshipTypeEnum('type').default('virtual_cohort').notNull(),
    domain: text('domain').notNull(),
    durationWeeks: integer('duration_weeks').default(4).notNull(),
    stipendInr: integer('stipend_inr').default(0).notNull(),
    prerequisiteCourseId: uuid('prerequisite_course_id').references(() => courses.id),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    internSlugIdx: uniqueIndex('internship_slug_idx').on(table.slug),
  })
);

export const internshipTasks = pgTable('internship_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  internshipId: uuid('internship_id')
    .references(() => internships.id, { onDelete: 'cascade' })
    .notNull(),
  sprintNumber: integer('sprint_number').notNull(),
  title: text('title').notNull(),
  specificationMarkdown: text('specification_markdown').notNull(),
});

export const internshipApplications = pgTable(
  'internship_applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    internshipId: uuid('internship_id')
      .references(() => internships.id, { onDelete: 'cascade' })
      .notNull(),
    status: applicationStatusEnum('status').default('applied').notNull(),
    githubRepoUrl: text('github_repo_url'),
    liveDemoUrl: text('live_demo_url'),
    evaluationScore: integer('evaluation_score'),
    appliedAt: timestamp('applied_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (table) => ({
    userInternUnique: uniqueIndex('user_intern_unique_idx').on(table.userId, table.internshipId),
  })
);

export const credentials = pgTable(
  'credentials',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    verificationCode: text('verification_code').notNull().unique(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    credentialType: credentialTypeEnum('credential_type').notNull(),
    referenceId: uuid('reference_id').notNull(),
    recipientName: text('recipient_name').notNull(),
    titleName: text('title_name').notNull(),
    pdfUrl: text('pdf_url'),
    issuedAt: timestamp('issued_at').defaultNow().notNull(),
  },
  (table) => ({
    verifyCodeIdx: uniqueIndex('verify_code_idx').on(table.verificationCode),
  })
);`;
