import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressRing';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { getProfessorDashboard } from '../../lib/api/dashboardApi';
import {
  MOCK_PROFESSOR_DASHBOARD,
} from '../../mocks/mockData';
import { useAuthStore } from '../../store/authStore';
import {
  Clock,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { COURSE_ACCENTS } from '../../lib/utils';

export function ProfessorDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const mockFallback = MOCK_PROFESSOR_DASHBOARD;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getProfessorDashboard()
      .then((data) => {
        if (mounted) {
          setDashboardData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load professor dashboard:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    {
      label: 'Active courses',
      value: dashboardData?.stats?.activeCourses ?? (loading ? '...' : 0),
      subtext: 'Teaching this term',
    },
    {
      label: 'Total students',
      value: dashboardData?.stats?.totalStudents ?? (loading ? '...' : 0),
      subtext: 'Enrolled across classes',
    },
    {
      label: 'Pending grading',
      value: dashboardData?.stats?.pendingGrading ?? (loading ? '...' : 0),
      subtext: 'Submissions to review',
    },
    {
      label: 'Active quizzes',
      value: dashboardData?.stats?.quizzesActive ?? (loading ? '...' : 0),
      subtext: 'Live published quizzes',
    },
  ];

  const courses = dashboardData?.courses || [];
  const submissions = dashboardData?.recentSubmissions || [];

  return (
    <div className="space-y-7">
      {/* Hero Card: Teaching Overview */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5044E4] via-[#5C50EA] to-[#6E4CEB] text-white p-7 sm:p-8 shadow-hero">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Text */}
          <div className="max-w-xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-200">
              FACULTY PORTAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Good morning, {user?.name || 'Professor'} 👋
            </h2>
            <p className="text-sm text-violet-100 font-normal leading-relaxed pr-4">
              You have {dashboardData?.stats?.pendingGrading ?? 0} submission{(dashboardData?.stats?.pendingGrading === 1) ? '' : 's'} awaiting grading and {dashboardData?.stats?.quizzesActive ?? 0} active quiz{(dashboardData?.stats?.quizzesActive === 1) ? '' : 'zes'} across {dashboardData?.stats?.activeCourses ?? courses.length} teaching courses.
            </p>
          </div>

          {/* Right Mini Card: Quick Action */}
          <div className="shrink-0 w-full md:w-auto">
            <div
              onClick={() => navigate('/professor/courses')}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all cursor-pointer flex items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">
                    QUICK ACCESS
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Manage Courses & Syllabi
                </h4>
                <p className="text-xs text-violet-200 mt-0.5">
                  {courses.length} active class{courses.length === 1 ? '' : 'es'}
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
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
        {/* Left Column (8 cols): Your Courses */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink tracking-tight">Your courses</h3>
            <Link
              to="/professor/courses"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
            >
              Manage all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-ink-border/80 shadow-soft p-5 divide-y divide-slate-100">
            {courses.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-ink">No courses created yet</p>
                <p className="text-xs text-ink-muted mt-1 mb-4">
                  Create your first course to begin publishing assignments, quizzes, and resources.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/professor/courses')}
                >
                  Create Course
                </Button>
              </div>
            ) : (
              courses.map((c, idx) => {
                const accentKeys = ['violet', 'blue', 'emerald', 'amber', 'rose'];
                const accent = COURSE_ACCENTS[accentKeys[idx % accentKeys.length]] || COURSE_ACCENTS.violet;
                return (
                  <div
                    key={c.courseId || c.id}
                    onClick={() => navigate(`/professor/courses/${c.courseId || c.id}`)}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${accent.tile} shrink-0`}
                      >
                        {c.courseCode || c.code}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-ink group-hover:text-brand-600 transition-colors">
                          {c.courseName || c.title || c.name}
                        </h4>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {c.section ? `${c.section} • ` : ''}
                          {c.enrollmentCount ?? c.studentCount ?? 0} students enrolled • {c.assignmentCount ?? 0} assignments
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {c.pendingSubmissions > 0 && (
                        <Badge variant="amber" size="xs">
                          {c.pendingSubmissions} to grade
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Recent Submissions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-ink-border/80 shadow-soft p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">Recent submissions</h3>
              <Badge variant="default" size="xs">
                {submissions.length} new
              </Badge>
            </div>

            <div className="space-y-2.5">
              {submissions.length === 0 ? (
                <div className="py-6 px-3 text-center">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-ink">No recent submissions</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Submissions from your students will appear here.
                  </p>
                </div>
              ) : (
                submissions.map((item) => {
                  const date = item.submittedAt ? new Date(item.submittedAt) : null;
                  const timeLabel = date
                    ? `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Recently';

                  return (
                    <div
                      key={item.submissionId || item.id}
                      onClick={() => navigate('/professor/submissions')}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-brand-50/60 transition-colors border border-slate-100 flex items-center justify-between cursor-pointer group"
                    >
                      <div className="max-w-[70%]">
                        <h5 className="text-xs font-bold text-ink group-hover:text-brand-600 transition-colors truncate">
                          {item.studentName}
                        </h5>
                        <p className="text-[11px] text-ink-muted mt-0.5 truncate">
                          {item.assignmentTitle} • {item.courseName}
                        </p>
                        <p className="text-[10px] text-ink-muted/80 mt-0.5">
                          {timeLabel}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.status === 'APPROVED' || item.status === 'GRADED'
                            ? 'success'
                            : item.status === 'REJECTED'
                            ? 'rose'
                            : 'amber'
                        }
                        size="xs"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
