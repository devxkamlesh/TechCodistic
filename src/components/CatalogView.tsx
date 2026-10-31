import React, { useMemo, useState } from 'react';
import {
  COURSE_CATEGORIES,
  Course,
  CourseType,
  DifficultyLevel,
  Enrollment,
} from '../db/schema';
import {
  filterAndSortCourses,
  generateSuggestedPathBundles,
} from '../services/domain.logic';
import { Search, ArrowRight, CheckCircle2, BookOpen, Compass } from 'lucide-react';

interface CatalogViewProps {
  courses: Course[];
  enrollments: Enrollment[];
  currentUserId: string;
  onSelectCourse: (courseId: string) => void;
  onExploreInternships: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  courses,
  enrollments,
  currentUserId,
  onSelectCourse,
  onExploreInternships,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedType, setSelectedType] = useState<'all' | CourseType>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | DifficultyLevel>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'catalog_order' | 'duration_asc' | 'duration_desc'>('catalog_order');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCourses = useMemo(
    () =>
      filterAndSortCourses(courses, {
        category: selectedCategory,
        type: selectedType,
        level: selectedLevel,
        searchQuery,
        sortBy,
      }),
    [courses, selectedCategory, selectedType, selectedLevel, searchQuery, sortBy]
  );

  const suggestedPaths = useMemo(
    () => generateSuggestedPathBundles(courses, enrollments, currentUserId),
    [courses, enrollments, currentUserId]
  );

  const completedCoursesCount = useMemo(
    () => enrollments.filter((e) => e.userId === currentUserId && e.isCompleted).length,
    [enrollments, currentUserId]
  );

  const enrollmentByCourseId = useMemo(() => {
    const map: Record<string, Enrollment> = {};
    for (const enr of enrollments) {
      if (enr.userId === currentUserId) {
        map[enr.courseId] = enr;
      }
    }
    return map;
  }, [enrollments, currentUserId]);

  const totalLearners = useMemo(
    () => courses.reduce((acc, c) => acc + c.learnerCount, 0),
    [courses]
  );

  return (
    <div className="space-y-12">
      {/* Hero Section: 2-Column Split with items-stretch */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1360px] mx-auto px-6 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Primary Value Proposition */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-medium text-indigo-700 tracking-wide">
                  techcodistic.com · Next.js App Router Architecture · Drizzle ORM · Dual-Track Credentials
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-slate-900 leading-[1.15]">
                  Industry-Verified Diplomas, Certificates &amp; Virtual Cohort Internships
                </h1>
                <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                  Master 50 career-defining technical and business tracks with adaptive HLS video
                  modules, randomized competency assessments, instant Virtual Internship Offer
                  Letters, and skill-gated partner company hiring backed by sub-50ms QR verification.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onSelectCourse('course-1')}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Start Full-Stack Next.js Diploma</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onExploreInternships}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Explore Dual-Track Internships
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Architectural Schematic Canvas */}
            <div className="lg:col-span-5">
              <div className="h-full bg-slate-900 text-slate-100 rounded-xl p-6 flex flex-col justify-between border border-slate-800">
                <div className="space-y-1">
                  <p className="text-xs text-indigo-300 font-mono-tabular">
                    Unified Identity &amp; Credential Engine
                  </p>
                  <h2 className="text-lg font-semibold text-white">
                    Decoupled LMS &amp; Dual-Track Internship Pipeline
                  </h2>
                </div>

                <svg
                  viewBox="0 0 440 210"
                  className="w-full h-auto my-4"
                  role="img"
                  aria-label="Architecture diagram showing Course Lifecycle and Virtual Internship Lifecycle converging into the Cryptographic QR Credential Engine"
                >
                  <rect x="8" y="12" width="195" height="78" rx="8" fill="#1E293B" stroke="#334155" />
                  <text x="22" y="34" fill="#A5B4FC" fontSize="11" fontFamily="monospace" fontWeight="600">
                    TRACK A: LMS CATALOG (50)
                  </text>
                  <text x="22" y="54" fill="#F8FAFC" fontSize="12" fontWeight="600">
                    HLS Video + Quiz (≥ 80%)
                  </text>
                  <text x="22" y="73" fill="#94A3B8" fontSize="11">
                    Issues CERT / DIP Credential
                  </text>

                  <rect x="8" y="114" width="195" height="82" rx="8" fill="#1E293B" stroke="#334155" />
                  <text x="22" y="136" fill="#6EE7B7" fontSize="11" fontFamily="monospace" fontWeight="600">
                    TRACK B: INTERNSHIPS
                  </text>
                  <text x="22" y="156" fill="#F8FAFC" fontSize="12" fontWeight="600">
                    Instant Offer → Repo Sprint
                  </text>
                  <text x="22" y="175" fill="#94A3B8" fontSize="11">
                    Skill-Gated Partner Hiring
                  </text>

                  {/* Connector paths */}
                  <path
                    d="M 203 51 C 230 51, 230 92, 255 92"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="2"
                  />
                  <path
                    d="M 203 155 C 230 155, 230 118, 255 118"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                  />

                  <rect x="255" y="50" width="176" height="110" rx="8" fill="#1E1B4B" stroke="#4F46E5" />
                  <text x="270" y="75" fill="#C7D2FE" fontSize="11" fontFamily="monospace" fontWeight="600">
                    EDGE VERIFIER
                  </text>
                  <text x="270" y="97" fill="#FFFFFF" fontSize="13" fontWeight="700">
                    /verify/[code]
                  </text>
                  <text x="270" y="117" fill="#A5B4FC" fontSize="11">
                    Drizzle Serverless Pool
                  </text>
                  <text x="270" y="137" fill="#34D399" fontSize="11" fontFamily="monospace">
                    ISR Revalidate: 3600s
                  </text>
                </svg>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono-tabular">
                  <span>PostgreSQL + Drizzle ORM</span>
                  <span>·</span>
                  <span>Passing Threshold: ≥ 80%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width 4-Column Quantitative Proof Row Below Hero Split */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-slate-500">Launch Curriculum</p>
              <p className="text-xl font-bold text-slate-900 font-mono-tabular mt-0.5 whitespace-nowrap">
                50 Courses
              </p>
              <p className="text-xs text-slate-500 mt-0.5">26 Diplomas · 24 Certificates</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Global Active Enrollments</p>
              <p className="text-xl font-bold text-slate-900 font-mono-tabular mt-0.5 whitespace-nowrap">
                {totalLearners.toLocaleString()} Learners
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Across 6 Industry Domains</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Dual-Track Internships</p>
              <p className="text-xl font-bold text-slate-900 font-mono-tabular mt-0.5 whitespace-nowrap">
                8 Active Tracks
              </p>
              <p className="text-xs text-slate-500 mt-0.5">4 Virtual Cohorts · 4 Partner Roles</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Edge QR Credential Lookup</p>
              <p className="text-xl font-bold text-slate-900 font-mono-tabular mt-0.5 whitespace-nowrap">
                &lt; 50ms ISR Lookup
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Cryptographic Verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Paths Section: Personalized Course Bundles Based on Completed Certificates */}
      <section
        aria-labelledby="suggested-paths-heading"
        className="max-w-[1360px] mx-auto px-6 space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 font-mono-tabular">
              <Compass className="w-4 h-4 shrink-0" />
              <span>PERSONALIZED PROFESSIONAL DEVELOPMENT ENGINE</span>
            </div>
            <h2 id="suggested-paths-heading" className="text-2xl font-bold text-slate-900">
              Suggested Paths Based on Your Completed Certificates
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl">
              Curated 3-course career bundles tailored to your verified credentials (
              {completedCoursesCount} completed), guiding your next logical milestone toward
              senior technical and management roles.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono-tabular shrink-0">
            {suggestedPaths.length} Recommended Career Bundles
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {suggestedPaths.map((bundle) => {
            const isFullyCompleted = bundle.completedCount === bundle.courses.length;
            return (
              <article
                key={bundle.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  {/* Unboxed metadata line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular text-slate-500">
                    <div>
                      <span className="font-semibold text-indigo-700">{bundle.targetRole}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{bundle.courses.length} Courses</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{bundle.totalHours} hrs total</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {bundle.completedCount}/{bundle.courses.length} Completed ({bundle.progressPercent}%)
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {bundle.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {bundle.rationale}
                  </p>

                  {/* 3-Step Course Progression Sequence (Hairline Dividers, No Nested Cards) */}
                  <div className="pt-3 border-t border-slate-100 divide-y divide-slate-100">
                    {bundle.courses.map((stepCourse, idx) => {
                      const isStepDone = bundle.completedCourseIds.includes(stepCourse.id);
                      const isNextStep =
                        !isStepDone && bundle.nextRecommendedCourse.id === stepCourse.id;

                      return (
                        <div
                          key={stepCourse.id}
                          className="py-2.5 flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-mono-tabular text-slate-500">
                              Step 0{idx + 1} · #{String(stepCourse.catalogNumber).padStart(2, '0')} ·{' '}
                              {stepCourse.type === 'diploma' ? 'Diploma' : 'Certificate'} ·{' '}
                              {stepCourse.durationHours}h
                            </p>
                            <button
                              type="button"
                              onClick={() => onSelectCourse(stepCourse.id)}
                              className="text-sm font-semibold text-slate-900 hover:text-indigo-700 transition-colors text-left truncate block max-w-full cursor-pointer"
                            >
                              {stepCourse.title}
                            </button>
                          </div>

                          <div className="shrink-0 text-xs font-mono-tabular">
                            {isStepDone ? (
                              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Earned</span>
                              </span>
                            ) : isNextStep ? (
                              <span className="text-indigo-700 font-semibold">
                                Next Step →
                              </span>
                            ) : (
                              <span className="text-slate-400">Upcoming</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bundle Primary Action Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 truncate">
                    {isFullyCompleted
                      ? 'All bundle credentials verified'
                      : `Next: #${String(bundle.nextRecommendedCourse.catalogNumber).padStart(2, '0')} ${bundle.nextRecommendedCourse.title}`}
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectCourse(bundle.nextRecommendedCourse.id)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>
                      {isFullyCompleted
                        ? 'Review Path Courses'
                        : `Start Step #${bundle.nextRecommendedCourse.catalogNumber}`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-[1360px] mx-auto px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Complete Top 50 Launch Course Catalog
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Filter all 50 courses in real time by course title or category. Select any course to
              launch the adaptive HLS video player and final competency assessment.
            </p>
          </div>
          <div
            aria-live="polite"
            className="text-xs text-slate-600 font-mono-tabular"
          >
            {searchQuery.trim() ? (
              <span>
                Matched <strong className="text-indigo-700">{filteredCourses.length}</strong> of{' '}
                {courses.length} courses for &ldquo;{searchQuery.trim()}&rdquo;
              </span>
            ) : (
              <span>
                Showing {filteredCourses.length} of {courses.length} published courses
              </span>
            )}
          </div>
        </div>

        {/* Real-Time Search & Filter Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Real-Time Search Input by Title or Category */}
            <div className="md:col-span-5">
              <label
                htmlFor="catalog-search-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Search Courses by Title or Category
              </label>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  id="catalog-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 50 courses by title or category (e.g., Python, Hospitality)..."
                  aria-label="Search courses by title or category"
                  className="w-full pl-9 pr-16 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute right-2.5 px-2 py-0.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Track Type Segmented Control */}
            <div className="md:col-span-4">
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                Credential Track Type
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['all', 'diploma', 'certificate'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedType(t)}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedType === t
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t === 'all' ? 'All Tracks' : t === 'diploma' ? 'Diplomas' : 'Certificates'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order Select */}
            <div className="md:col-span-3">
              <label
                htmlFor="catalog-sort-select"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Catalog Sort Index
              </label>
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="catalog_order">Blueprint Order (#1 – #50)</option>
                <option value="popular">Most Popular (Learner Count DESC)</option>
                <option value="duration_asc">Duration: Shortest First</option>
                <option value="duration_desc">Duration: Comprehensive First</option>
              </select>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            {['All Categories', ...COURSE_CATEGORIES].map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-indigo-700 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}

            {/* Difficulty Filter */}
            <div className="ml-auto flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl === 'all'
                    ? 'All Levels'
                    : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
            <p className="text-base font-semibold text-slate-900">
              No courses match your current filter criteria
            </p>
            <p className="text-sm text-slate-500">
              Reset the category, track type, or search query to browse all 50 launch courses.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All Categories');
                setSelectedType('all');
                setSelectedLevel('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const enrollment = enrollmentByCourseId[course.id];
              const isCompleted = enrollment?.isCompleted ?? false;
              const isEnrolled = Boolean(enrollment);

              return (
                <article
                  key={course.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Unboxed inline metadata — strictly zero pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-mono-tabular">
                      <span className="font-semibold text-indigo-700">
                        #{String(course.catalogNumber).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700">
                        {course.type === 'diploma' ? 'Diploma Track' : 'Certificate Track'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{course.level}</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.durationHours} hrs</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500">{course.category}</p>

                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {course.summary}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 font-mono-tabular">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Passed ({enrollment?.quizScore}%)</span>
                        </span>
                      ) : isEnrolled ? (
                        <span className="text-indigo-700 font-semibold">
                          In Progress · {enrollment?.progressPercent}%
                        </span>
                      ) : (
                        <span>{course.learnerCount.toLocaleString()} learners</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectCourse(course.id)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : isEnrolled
                          ? 'bg-indigo-700 text-white hover:bg-indigo-800'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {isCompleted
                          ? 'Review & Certificate'
                          : isEnrolled
                          ? 'Continue Course'
                          : 'Start Course'}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
