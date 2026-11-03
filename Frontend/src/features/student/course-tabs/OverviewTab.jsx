import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  FileText,
  Download,
  CheckCircle2,
  Lock,
  ChevronRight,
  MessageSquare,
  BookOpen,
  Calendar,
  Users,
  Layers,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { listResources } from '../../../lib/api/resourcesApi';
import { listCourseAssignments } from '../../../lib/api/assignmentsApi';
import { listCourseQuizzes } from '../../../lib/api/quizzesApi';

export function OverviewTab({ course, setActiveTab }) {
  const navigate = useNavigate();
  const courseId = course?.courseId || course?.id;

  const [resources, setResources] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    setLoading(true);

    Promise.all([
      listResources(courseId).catch(() => []),
      listCourseAssignments(courseId).catch(() => []),
      listCourseQuizzes(courseId).catch(() => []),
    ]).then(([resData, assignData, quizData]) => {
      if (mounted) {
        setResources(resData || []);
        setAssignments(assignData || []);
        setQuizzes(quizData || []);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [courseId]);

  const instructorName = course?.instructor || course?.professorName || 'Faculty Instructor';
  const instructorInitials =
    instructorName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'FI';

  const realModules = course?.modules || [];

  return (
    <div className="space-y-6">
      {/* Course Overview & Summary Banner */}
      <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-100 text-violet-700">
              {course?.code || course?.courseCode}
            </span>
            <span className="text-xs font-semibold text-ink-muted">
              {course?.section || 'Section 01'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {course?.enrollmentCount ?? 0} enrolled students
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Course
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-ink mb-1">About this course</h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            {course?.description || 'Welcome to this course curriculum.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Left Column & Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column (8 cols): Real Materials, Real Assignments, Modules */}
        <div className="lg:col-span-8 space-y-6">
          {/* Real Learning Materials & Resources Section */}
          <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink">Course resources & materials</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Lecture slides, syllabi, and reference files uploaded by your instructor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('Resources')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0"
              >
                Browse All ({resources.length})
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-center text-xs text-ink-muted">Loading course materials...</div>
            ) : resources.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-ink">No course materials uploaded yet</p>
                <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                  Your instructor has not uploaded lecture notes, syllabi, or reference documents for this course yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {resources.slice(0, 3).map((r) => (
                  <div
                    key={r.resourceId || r.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink">{r.title}</h4>
                        <p className="text-[10px] text-ink-muted mt-0.5">
                          {r.description || 'Uploaded course document'} ·{' '}
                          {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                    {r.fileUrl ? (
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        Download
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('Resources')}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-xs font-semibold text-ink transition-colors shadow-2xs"
                      >
                        View
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Coursework & Assignments Section */}
          <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink">Active coursework & assignments</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Deadlines, homework problem sets, and lab submissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('Assignments')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0"
              >
                View All ({assignments.length})
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-center text-xs text-ink-muted">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-ink">No assignments published yet</p>
                <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                  There are currently no homework tasks, lab exercises, or project prompts assigned for this course.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.slice(0, 3).map((a) => {
                  const status = (a.studentStatus || a.myStatus || 'PENDING').toUpperCase();
                  const dueDate = a.dueDate ? new Date(a.dueDate) : null;
                  const dueLabel = dueDate
                    ? dueDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'No due date';

                  return (
                    <div
                      key={a.assignmentId}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-white flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-ink">{a.title}</h4>
                          <Badge
                            variant={
                              status === 'APPROVED' || status === 'GRADED'
                                ? 'success'
                                : status === 'SUBMITTED'
                                ? 'purple'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {status === 'SUBMITTED' ? 'Submitted' : status === 'APPROVED' || status === 'GRADED' ? 'Graded' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-ink-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Due: {dueLabel} · Max Marks: {a.maxMarks || 100}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setActiveTab('Assignments')}
                        className="font-semibold text-xs bg-white"
                      >
                        {status === 'SUBMITTED' ? 'Review' : 'Open'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Course Modules Section */}
          <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">Course modules</h3>
              <span className="text-[11px] font-semibold text-ink-muted">Curriculum Structure</span>
            </div>

            {realModules.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-ink">No curriculum modules structured yet</p>
                <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                  Syllabus units and curriculum chapters will appear here once published by your professor.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {realModules.map((mod, idx) => (
                  <div
                    key={mod.id || idx}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="text-sm font-bold text-ink-muted w-6">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-ink">{mod.title}</h4>
                        <p className="text-[11px] text-ink-muted mt-0.5">{mod.summary || mod.description}</p>
                      </div>
                    </div>

                    <div>
                      {mod.status === 'complete' && (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      {mod.status === 'in_progress' && (
                        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                          In progress
                        </span>
                      )}
                      {mod.status === 'locked' && (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Quick Tabs, Stats & Instructor */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Navigation */}
          <div className="bg-white rounded-2xl border border-ink-border p-5 shadow-soft space-y-3">
            <h3 className="text-sm font-bold text-ink mb-1">Quick actions</h3>
            <div className="space-y-2.5">
              <div
                onClick={() => setActiveTab('Assignments')}
                className="p-3 rounded-xl border-l-4 border-l-brand-500 bg-slate-50 hover:bg-brand-50/60 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-ink group-hover:text-brand-600 transition-colors">
                    View Course Assignments
                  </h5>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {assignments.length > 0 ? `${assignments.length} published assignment(s)` : 'Check Deadlines & Rubrics'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <div
                onClick={() => setActiveTab('Resources')}
                className="p-3 rounded-xl border-l-4 border-l-violet-500 bg-slate-50 hover:bg-violet-50/60 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-ink group-hover:text-violet-600 transition-colors">
                    Browse Syllabus & Resources
                  </h5>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {resources.length > 0 ? `${resources.length} resource file(s)` : 'Lecture Slides & Files'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-violet-600 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <div
                onClick={() => setActiveTab('Quizzes')}
                className="p-3 rounded-xl border-l-4 border-l-emerald-500 bg-slate-50 hover:bg-emerald-50/60 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-ink group-hover:text-emerald-600 transition-colors">
                    Take Course Quizzes
                  </h5>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {quizzes.length > 0 ? `${quizzes.length} available quiz(zes)` : 'Knowledge Checks & Practice'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <div
                onClick={() => setActiveTab('Grades')}
                className="p-3 rounded-xl border-l-4 border-l-amber-500 bg-slate-50 hover:bg-amber-50/60 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-ink group-hover:text-amber-600 transition-colors">
                    Check Gradebook
                  </h5>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Scores, feedback & completion
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Your Instructor Card */}
          <div className="bg-white rounded-2xl border border-ink-border p-5 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-ink">Your instructor</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  initials={instructorInitials}
                  size="md"
                  color="violet"
                />
                <div>
                  <h4 className="text-xs font-bold text-ink">{instructorName}</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Course Instructor
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/messages')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-brand-50 text-ink-muted hover:text-brand-600 transition-colors"
                title="Send message to instructor"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
