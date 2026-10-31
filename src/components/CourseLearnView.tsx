import React, { useState } from 'react';
import {
  AssessmentQuestion,
  Course,
  Credential,
  Enrollment,
  Lesson,
} from '../db/schema';
import {
  ArrowLeft,
  CheckCircle2,
  Play,
  Pause,
  Award,
  AlertTriangle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface CourseLearnViewProps {
  course: Course;
  lessons: Lesson[];
  questions: AssessmentQuestion[];
  enrollment: Enrollment | undefined;
  existingCredential: Credential | undefined;
  onBackToCatalog: () => void;
  onMarkLessonComplete: (courseId: string, lessonId: string) => void;
  onSubmitAssessment: (
    courseId: string,
    selectedAnswers: Record<string, number>
  ) => {
    scorePercent: number;
    passed: boolean;
    issuedCredential: Credential | null;
  };
  onInspectCredential: (verificationCode: string) => void;
}

export const CourseLearnView: React.FC<CourseLearnViewProps> = ({
  course,
  lessons,
  questions,
  enrollment,
  existingCredential,
  onBackToCatalog,
  onMarkLessonComplete,
  onSubmitAssessment,
  onInspectCredential,
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'assessment'>('lessons');
  const [activeLessonId, setActiveLessonId] = useState<string>(lessons[0]?.id ?? '');
  const [hlsBitrate, setHlsBitrate] = useState<'360p' | '720p' | '1080p'>('1080p');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [assessmentResult, setAssessmentResult] = useState<{
    scorePercent: number;
    passed: boolean;
    issuedCredential: Credential | null;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];
  const completedIds = enrollment?.completedLessonIds ?? [];
  const progressPercent = enrollment?.progressPercent ?? 0;

  const handleCompleteCurrentLesson = () => {
    if (!activeLesson) return;
    onMarkLessonComplete(course.id, activeLesson.id);
    const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      setActiveLessonId(lessons[currentIndex + 1].id);
    } else {
      setActiveTab('assessment');
    }
  };

  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(selectedAnswers).length < questions.length) {
      setValidationError(
        `Please answer all ${questions.length} assessment questions before submitting.`
      );
      return;
    }
    setValidationError(null);
    const res = onSubmitAssessment(course.id, selectedAnswers);
    setAssessmentResult(res);
  };

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-8 space-y-8">
      {/* Top Breadcrumb & Course Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to 50-Course Catalog</span>
          </button>

          <div className="text-xs text-slate-500 font-mono-tabular">
            <span>Course #{String(course.catalogNumber).padStart(2, '0')}</span>
            <span className="mx-1.5">·</span>
            <span>{course.category}</span>
            <span className="mx-1.5">·</span>
            <span className="capitalize">{course.type}</span>
            <span className="mx-1.5">·</span>
            <span>Passing Threshold: ≥ {course.passingScore}%</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{course.title}</h1>
            <p className="text-sm text-slate-600 max-w-3xl">{course.summary}</p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right font-mono-tabular">
              <p className="text-xs text-slate-500">Module Progress</p>
              <p className="text-lg font-bold text-slate-900">
                {progressPercent}% ({completedIds.length}/{lessons.length} Modules)
              </p>
            </div>
            {existingCredential && (
              <button
                type="button"
                onClick={() => onInspectCredential(existingCredential.verificationCode)}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Verify Issued Credential ({existingCredential.verificationCode})</span>
              </button>
            )}
          </div>
        </div>

        {/* Mode Switcher: Modules vs Final Assessment */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-indigo-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            1. Adaptive HLS Video Modules ({lessons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'assessment'
                ? 'bg-indigo-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            2. Final Competency Assessment ({questions.length} Questions · ≥ {course.passingScore}%)
          </button>
        </div>
      </div>

      {activeTab === 'lessons' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Columns: Adaptive HLS Video Stream Simulator & Lesson Notes */}
          <div className="lg:col-span-8 space-y-6">
            {activeLesson && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {/* Simulated HLS Adaptive Video Viewport */}
                <div className="bg-slate-950 text-white p-6 sm:p-8 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono-tabular">
                    <span>HLS MANIFEST: {activeLesson.videoHlsUrl}</span>
                    <span>STARTUP LATENCY: 140ms · BITRATE: {hlsBitrate}</span>
                  </div>

                  <div className="py-6 border-y border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <p className="text-xs text-indigo-400 font-mono-tabular">
                        Module {activeLesson.sortOrder} of {lessons.length} ·{' '}
                        {activeLesson.durationMinutes} mins
                      </p>
                      <h2 className="text-xl font-bold text-white">{activeLesson.title}</h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPlaying((prev) => !prev)}
                      className="px-4 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlaying ? 'Pause HLS Stream' : 'Play Adaptive Stream'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Adaptive Bitrate (HLS):</span>
                      {(['360p', '720p', '1080p'] as const).map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setHlsBitrate(rate)}
                          className={`px-2.5 py-1 text-xs font-mono-tabular rounded transition-colors cursor-pointer ${
                            hlsBitrate === rate
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {rate}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleCompleteCurrentLesson}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {completedIds.includes(activeLesson.id)
                          ? 'Module Synced · Advance Next'
                          : 'Complete Module & Sync Progress'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Lesson Study Notes & Learning Outcomes */}
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <BookOpen className="w-4 h-4 text-indigo-700" />
                    <span>Synchronized Module Syllabus &amp; Technical Notes</span>
                  </div>

                  <div className="space-y-2.5 text-sm text-slate-700 leading-relaxed">
                    {activeLesson.contentMarkdown.split('\n').map((line, idx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;
                      if (trimmed.startsWith('### ')) {
                        return (
                          <h3 key={idx} className="text-base font-bold text-slate-900 pt-1">
                            {trimmed.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (trimmed.startsWith('#### ')) {
                        return (
                          <h4 key={idx} className="text-xs font-semibold uppercase tracking-wider text-slate-500 pt-2">
                            {trimmed.replace('#### ', '')}
                          </h4>
                        );
                      }
                      const cleanText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');
                      if (trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
                        return (
                          <p key={idx} className="pl-3 text-slate-700">
                            {cleanText}
                          </p>
                        );
                      }
                      return (
                        <p key={idx} className="text-slate-700">
                          {cleanText}
                        </p>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-semibold text-slate-900 mb-2">
                      Verified Learning Outcomes for {course.title}
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                      {course.outcomes.map((outcome, idx) => (
                        <li key={idx}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right 4 Columns: Syllabus Bitmap Progress & Final Assessment Trigger */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Course Module Bitmap</h2>
              <span className="text-xs font-mono-tabular text-slate-500">
                {completedIds.length}/{lessons.length} Synced
              </span>
            </div>

            <div className="space-y-2">
              {lessons.map((lesson) => {
                const isDone = completedIds.includes(lesson.id);
                const isCurrent = activeLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setActiveLessonId(lesson.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-mono-tabular text-slate-500">
                        Module 0{lesson.sortOrder} · {lesson.durationMinutes}m
                      </p>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {lesson.title}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-mono-tabular shrink-0 ${
                        isDone ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {isDone ? '✓ Synced' : 'Pending'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <p className="text-xs text-slate-600">
                Ready to validate your competency? Achieve ≥ {course.passingScore}% on the Final
                Assessment to immediately issue your verifiable{' '}
                {course.type === 'diploma' ? 'Diploma' : 'Certificate'}.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('assessment')}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer"
              >
                Proceed to Final Assessment
              </button>
            </div>
          </aside>
        </div>
      ) : (
        /* Final Assessment Engine */
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Final Competency Assessment: {course.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-mono-tabular">
                {questions.length} Questions · Required Passing Score: ≥ {course.passingScore}% ·
                Automated Cryptographic Credential Trigger
              </p>
            </div>
          </div>

          {assessmentResult && (
            <div
              role="status"
              className={`p-5 rounded-xl border ${
                assessmentResult.passed
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold flex items-center gap-2">
                    {assessmentResult.passed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>
                          Assessment Passed ({assessmentResult.scorePercent}%) — Official Credential
                          Issued!
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        <span>
                          Score: {assessmentResult.scorePercent}% (Minimum {course.passingScore}%
                          Required)
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-xs">
                    {assessmentResult.passed && assessmentResult.issuedCredential
                      ? `Verification ID: ${assessmentResult.issuedCredential.verificationCode} has been recorded on the edge registry.`
                      : 'Review your selected answers below and resubmit to achieve ≥ 80%.'}
                  </p>
                </div>

                {assessmentResult.passed && assessmentResult.issuedCredential && (
                  <button
                    type="button"
                    onClick={() =>
                      onInspectCredential(assessmentResult.issuedCredential!.verificationCode)
                    }
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Open Edge Verification Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {validationError && (
            <div
              role="alert"
              className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-800"
            >
              {validationError}
            </div>
          )}

          <form onSubmit={handleAssessmentSubmit} className="space-y-6">
            {questions.map((q, qIdx) => (
              <fieldset
                key={q.id}
                className="p-5 rounded-xl border border-slate-200 space-y-3"
              >
                <legend className="text-sm font-bold text-slate-900 px-1">
                  Question {qIdx + 1}: {q.question}
                </legend>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    return (
                      <label
                        key={optIdx}
                        className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 text-slate-900 font-medium'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={isSelected}
                          onChange={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                          }
                          className="mt-1 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-mono-tabular">
                Answered {Object.keys(selectedAnswers).length} of {questions.length} questions
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors cursor-pointer"
              >
                Submit Final Assessment &amp; Verify Score
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
