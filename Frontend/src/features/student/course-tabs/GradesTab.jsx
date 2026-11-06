import React, { useState, useEffect } from 'react';
import { getMyCourseGrades } from '../../../lib/api/gradesApi';
import { Badge } from '../../../components/ui/Badge';
import { CompletionCertificateModal } from '../../../components/ui/CompletionCertificateModal';
import { useAuthStore } from '../../../store/authStore';
import { FileText, HelpCircle } from 'lucide-react';

export function GradesTab({ courseId, course }) {
  const [gradesData, setGradesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificateQuiz, setCertificateQuiz] = useState(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    getMyCourseGrades(courseId)
      .then((data) => {
        setGradesData(data);
      })
      .catch((err) => {
        console.error('Failed to load student course grades:', err);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-ink-border p-8 text-center text-xs text-ink-muted">
        Loading grades from server...
      </div>
    );
  }

  const assignments = gradesData?.assignments || [];
  const quizzes = gradesData?.quizzes || [];
  const totalObtained = gradesData?.totalObtained ?? 0;
  const totalMax = gradesData?.totalMax ?? 0;
  const percentage = gradesData?.percentage;

  return (
    <div className="space-y-6">
      {/* Grade Summary Card */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-200">
            Course Performance
          </span>
          <h3 className="text-xl font-extrabold text-white mt-1">
            {course?.title || course?.courseName || 'Class Grades'}
          </h3>
          <p className="text-xs text-violet-100 mt-0.5">
            Calculated across all approved assignment submissions and completed quizzes.
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20">
          <div>
            <span className="text-[10px] uppercase font-bold text-violet-200 block">TOTAL SCORE</span>
            <span className="text-xl font-black text-white">
              {totalObtained} / {totalMax}
            </span>
          </div>
          <div className="border-l border-white/20 pl-6">
            <span className="text-[10px] uppercase font-bold text-violet-200 block">OVERALL</span>
            <span className="text-2xl font-black text-white">
              {percentage != null ? `${percentage}%` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Graded Coursework Table */}
      <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
        <h4 className="text-sm font-bold text-ink flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600" />
          Assignments ({assignments.length})
        </h4>

        {assignments.length === 0 ? (
          <p className="text-xs text-ink-muted py-4 text-center">No assignments in this course yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 text-ink-muted uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 font-bold">Assignment Title</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold">Score</th>
                  <th className="py-2.5 font-bold">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((a) => (
                  <tr key={a.assignmentId} className="hover:bg-slate-50/70">
                    <td className="py-3 font-semibold text-ink">{a.title}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          a.status === 'APPROVED'
                            ? 'success'
                            : a.status === 'REJECTED'
                            ? 'rose'
                            : a.status === 'SUBMITTED'
                            ? 'submitted'
                            : 'default'
                        }
                        size="xs"
                      >
                        {a.status || 'PENDING'}
                      </Badge>
                    </td>
                    <td className="py-3 font-bold text-ink">
                      {a.marksObtained != null ? (
                        <span className="text-emerald-700">
                          {a.marksObtained} / {a.maxMarks}
                        </span>
                      ) : (
                        <span className="text-ink-muted font-normal">-- / {a.maxMarks}</span>
                      )}
                    </td>
                    <td className="py-3 text-ink-muted italic">
                      {a.feedback ? `"${a.feedback}"` : <span className="not-italic text-slate-300">None</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quizzes Table */}
      <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
        <h4 className="text-sm font-bold text-ink flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-violet-600" />
          Quizzes ({quizzes.length})
        </h4>

        {quizzes.length === 0 ? (
          <p className="text-xs text-ink-muted py-4 text-center">No quizzes in this course yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-100 text-ink-muted uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 font-bold">Quiz Title</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold">Score</th>
                  <th className="py-2.5 font-bold">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizzes.map((q) => {
                  const pct = q.totalMarks > 0 && q.score != null ? Math.round((q.score / q.totalMarks) * 100) : 0;
                  const isSubmitted = q.status === 'SUBMITTED';
                  const isPassed = isSubmitted && pct >= 50;
                  const isFailed = isSubmitted && pct < 50;

                  return (
                    <tr key={q.quizId} className="hover:bg-slate-50/70">
                      <td className="py-3 font-semibold text-ink">{q.title}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            isPassed
                              ? 'success'
                              : isFailed
                              ? 'rose'
                              : q.status === 'IN_PROGRESS'
                              ? 'warning'
                              : 'default'
                          }
                          size="xs"
                        >
                          {isPassed
                            ? `Passed (${pct}%)`
                            : isFailed
                            ? `Failed (${pct}%)`
                            : q.status || 'NOT ATTEMPTED'}
                        </Badge>
                      </td>
                      <td className="py-3 font-bold text-ink">
                        {q.score != null ? (
                          <span className={isPassed ? 'text-emerald-700' : 'text-rose-600'}>
                            {q.score} / {q.totalMarks} ({pct}%)
                          </span>
                        ) : (
                          <span className="text-ink-muted font-normal">-- / {q.totalMarks}</span>
                        )}
                      </td>
                      <td className="py-3">
                        {isPassed ? (
                          <button
                            type="button"
                            onClick={() => setCertificateQuiz(q)}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                          >
                            View certificate
                          </button>
                        ) : isFailed ? (
                          <span className="text-xs font-medium text-rose-500">
                            Failed (&lt; 50%) — No certificate
                          </span>
                        ) : (
                          <span className="text-ink-muted">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <CompletionCertificateModal
        isOpen={Boolean(certificateQuiz)}
        onClose={() => setCertificateQuiz(null)}
        studentName={user?.name}
        courseName={course?.title || course?.courseName}
        courseCode={course?.courseCode}
        quiz={certificateQuiz}
        submittedAt={certificateQuiz?.submittedAt}
      />
    </div>
  );
}
