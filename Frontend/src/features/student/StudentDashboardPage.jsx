import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { ProgressBar } from '../../components/ui/ProgressRing';
import { StatCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { getStudentDashboard } from '../../lib/api/dashboardApi';
import {
  MOCK_STUDENT_DASHBOARD,
} from '../../mocks/mockData';
import { useAuthStore } from '../../store/authStore';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { COURSE_ACCENTS } from '../../lib/utils';

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const mockFallback = MOCK_STUDENT_DASHBOARD;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlanDrawerOpen, setIsPlanDrawerOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    getStudentDashboard()
      .then((data) => {
        if (mounted) {
          setDashboardData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load student dashboard:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    {
      label: 'Enrolled courses',
      value: dashboardData?.stats?.enrolledCourses ?? (loading ? '...' : 0),
      subtext: 'Active classes',
    },
    {
      label: 'Due this week',
      value: dashboardData?.stats?.dueThisWeek ?? (loading ? '...' : 0),
      subtext: 'Next 7 days',
    },
    {
      label: 'Average grade',
      value:
        dashboardData?.stats?.averageGradePercent != null
          ? `${dashboardData.stats.averageGradePercent}%`
          : loading
          ? '...'
          : 'N/A',
      subtext: 'Across graded work',
    },
    {
      label: 'Pending assignments',
      value: dashboardData?.stats?.pendingAssignments ?? (loading ? '...' : 0),
      subtext: 'Awaiting submission',
    },
  ];

  const courses = dashboardData?.courses || [];
  const upcoming = dashboardData?.upcomingDeadlines || [];

  return (
    <div className="space-y-7">
      {/* Hero Card: "Your week at a glance" */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5044E4] via-[#5C50EA] to-[#6E4CEB] text-white p-7 sm:p-8 shadow-hero">
        {/* Subtle decorative glowing shapes */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 w-64 h-64 rounded-full bg-white/5 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Text */}
          <div className="max-w-xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-200">
              ACADEMIC DASHBOARD
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name || 'Student'} 👋
            </h2>
            <p className="text-sm text-violet-100 font-normal leading-relaxed pr-4">
              You have {dashboardData?.stats?.pendingAssignments ?? 0} pending assignment{(dashboardData?.stats?.pendingAssignments === 1) ? '' : 's'} and {dashboardData?.stats?.dueThisWeek ?? 0} item{(dashboardData?.stats?.dueThisWeek === 1) ? '' : 's'} due this week across {dashboardData?.stats?.enrolledCourses ?? courses.length} enrolled courses.
            </p>
          </div>

          {/* Right Progress Ring & CTA */}
          <div className="flex items-center gap-6 shrink-0 self-stretch md:self-auto justify-between md:justify-end">
            <ProgressRing
              value={dashboardData?.stats?.averageGradePercent ? Math.round(dashboardData.stats.averageGradePercent) : 0}
              size={100}
              strokeWidth={8}
              label="PROGRESS"
              trackColor="rgba(255, 255, 255, 0.2)"
              progressColor="#FFFFFF"
            />
            {courses.length === 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/student/classes')}
                className="bg-white/95 text-brand-700 hover:bg-white hover:text-brand-800 border-none font-bold shadow-md rounded-xl text-xs px-4 py-2.5"
              >
                Join a class
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlanDrawerOpen(true)}
                className="bg-white/95 text-brand-700 hover:bg-white hover:text-brand-800 border-none font-bold shadow-md rounded-xl text-xs px-4 py-2.5"
              >
                Review plan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            label={stat.label}
            value={stat.value}
            subtext={stat.subtext}
          />
        ))}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column (8 cols): Continue Learning */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink tracking-tight">
              Continue learning
            </h3>
            <Link
              to="/student/classes"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
            >
              View all classes
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Course Cards Grid */}
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink-border/80 p-8 text-center shadow-soft">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink">No courses enrolled yet</p>
              <p className="text-xs text-ink-muted mt-1 mb-4">
                Join a class using a code from your instructor to get started.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate('/student/classes')}
              >
                Join a Class
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {courses.map((course, idx) => {
                const accentKeys = ['violet', 'blue', 'emerald', 'amber', 'rose'];
                const accentKey = course.accent || accentKeys[idx % accentKeys.length];
                const accent = COURSE_ACCENTS[accentKey] || COURSE_ACCENTS.violet;
                const progress = course.progressPercent ?? 0;
                return (
                  <div
                    key={course.courseId || course.id}
                    onClick={() => navigate(`/student/classes/${course.courseId || course.id}`)}
                    className="bg-white rounded-2xl border border-ink-border/80 p-5 shadow-soft hover:shadow-card hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Course Code Tile */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${accent.tile}`}
                        >
                          {course.courseCode || course.code}
                        </div>
                        <span className="text-[11px] text-ink-muted group-hover:text-ink font-medium">
                          {course.totalAssignments ? `${course.completedAssignments || 0}/${course.totalAssignments} done` : 'Active'}
                        </span>
                      </div>

                      {/* Title & Instructor */}
                      <h4 className="text-sm font-bold text-ink group-hover:text-brand-600 transition-colors line-clamp-1 mb-1">
                        {course.courseName || course.title || course.name}
                      </h4>
                      <p className="text-xs text-ink-muted mb-6">
                        {course.professorName || course.instructor || course.instructorName || 'Faculty'}
                      </p>
                    </div>

                    {/* Course Progress */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
                        <span className="text-ink-muted uppercase tracking-wider text-[10px]">
                          COURSE PROGRESS
                        </span>
                        <span className="text-ink font-bold">{progress}%</span>
                      </div>
                      <ProgressBar
                        value={progress}
                        color={accent.bar}
                        height="h-1.5"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Upcoming Tasks */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink tracking-tight">Upcoming</h3>
            <span className="text-xs font-medium text-ink-muted">
              Next 14 days
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-ink-border/80 shadow-soft p-3 divide-y divide-slate-100">
            {upcoming.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-ink">All caught up!</p>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  No deadlines due in the next 14 days.
                </p>
              </div>
            ) : (
              upcoming.map((item) => {
                const dueDate = (item.dueDate || item.dueAt) ? new Date(item.dueDate || item.dueAt) : null;
                const month = dueDate ? dueDate.toLocaleString('default', { month: 'short' }).toUpperCase() : 'DUE';
                const day = dueDate ? dueDate.getDate() : '';
                const timeString = dueDate ? dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                const isQuiz = item.type === 'quiz';
                const taskId = item.assignmentId || item.id;

                return (
                  <div
                    key={`${item.type || 'task'}-${taskId}`}
                    onClick={() => {
                      if (isQuiz) {
                        navigate(`/student/classes/${item.courseId}/quizzes/${taskId}`);
                      } else {
                        navigate(`/student/classes/${item.courseId}`);
                      }
                    }}
                    className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Date chip */}
                      <div className="w-12 h-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-center font-bold text-[10px] text-ink shrink-0 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                        <span className="text-[9px] uppercase leading-none text-ink-muted">{month}</span>
                        <span className="text-xs font-extrabold leading-none mt-0.5">{day}</span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-ink group-hover:text-brand-600 transition-colors line-clamp-1">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                          {timeString ? `${timeString} • ` : ''}{item.courseName}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={isQuiz ? 'quiz' : 'assignment'}
                      size="xs"
                      className="font-medium shrink-0 ml-2"
                    >
                      {item.type}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Review Plan Drawer / Modal */}
      <Modal
        isOpen={isPlanDrawerOpen}
        onClose={() => setIsPlanDrawerOpen(false)}
        title="Weekly Learning Plan"
        description="Priority breakdown for the current semester based on active coursework and deadlines."
      >
        <div className="space-y-3 pt-2">
          {upcoming.length === 0 ? (
            <div className="p-6 text-center text-ink-muted">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink">You're all caught up!</p>
              <p className="text-xs mt-1">No upcoming deadlines or urgent tasks for this week.</p>
            </div>
          ) : (
            upcoming.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-ink">{item.title}</p>
                    <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {item.courseCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Upcoming'} · {item.type || 'Coursework'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setIsPlanDrawerOpen(false)}>
            Close plan
          </Button>
        </div>
      </Modal>
    </div>
  );
}
