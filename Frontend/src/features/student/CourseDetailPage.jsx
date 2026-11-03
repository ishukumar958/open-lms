import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MOCK_COURSE_DETAIL } from '../../mocks/mockData';
import { ProgressBar } from '../../components/ui/ProgressRing';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { MessageSquare, BookOpen } from 'lucide-react';
import { OverviewTab } from './course-tabs/OverviewTab';
import { ResourcesTab } from './course-tabs/ResourcesTab';
import { AssignmentsTab } from './course-tabs/AssignmentsTab';
import { QuizzesTab } from './course-tabs/QuizzesTab';
import { GradesTab } from './course-tabs/GradesTab';
import { getCourse } from '../../lib/api/coursesApi';

export function CourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    setIsLoading(true);
    getCourse(courseId)
      .then((data) => {
        if (data) {
          setCourse({
            id: data.courseId,
            courseId: data.courseId,
            title: data.courseName,
            courseName: data.courseName,
            code: data.courseCode,
            courseCode: data.courseCode,
            section: data.section || 'Section 01',
            instructor: data.professorName || 'Professor',
            professorName: data.professorName || 'Professor',
            description: data.description || 'Welcome to this course curriculum.',
            enrollmentCount: data.enrollmentCount ?? 0,
            progress: 0,
          });
        }
      })
      .catch((err) => console.error('Failed to get course:', err))
      .finally(() => setIsLoading(false));
  }, [courseId]);

  if (isLoading || !course) {
    return (
      <div className="bg-white rounded-2xl border border-ink-border p-12 text-center shadow-soft">
        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-ink">Loading class details...</p>
        <p className="text-xs text-ink-muted mt-1">Retrieving course syllabus, assignments, and grades.</p>
      </div>
    );
  }

  const tabs = ['Overview', 'Resources', 'Assignments', 'Quizzes', 'Grades'];

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-muted mb-1">
            <Link to="/student/classes" className="hover:text-brand-600">
              My classes
            </Link>
            <span>/</span>
            <span className="text-ink font-semibold">{course.code}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">
              {course.title}
            </h1>
            <span className="text-xs font-semibold text-ink-muted">
              {course.code} · {course.term || 'Fall Term 2026'}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={MessageSquare}
          onClick={() => navigate('/messages')}
          className="border-slate-300 font-semibold text-xs"
        >
          Class discussion
        </Button>
      </div>

      {/* Dark Navy Course Header Card */}
      <div className="rounded-3xl bg-navy-900 text-white p-6 sm:p-8 shadow-card border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <BookOpen className="w-7 h-7" />
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-violet-400 mb-1">
              {course.code} · {course.section}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1.5">{course.title}</h2>
            <p className="text-xs text-slate-300 font-normal">{course.description || 'Active class curriculum.'}</p>
          </div>
        </div>

        {/* Right Course Progress */}
        <div className="w-full md:w-64 space-y-2 shrink-0 bg-navy-800/80 p-4 rounded-2xl border border-navy-700/60">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              COURSE PROGRESS
            </span>
            <span className="text-lg font-bold text-white">{course.progress}%</span>
          </div>
          <ProgressBar
            value={course.progress}
            color="bg-violet-500"
            trackColor="bg-navy-950"
            height="h-2"
          />
          <p className="text-[11px] text-slate-400 text-right">{course.weekStatus}</p>
        </div>
      </div>

      {/* Course Sub Navigation Tabs */}
      <div className="border-b border-ink-border flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === tab
                ? 'text-brand-600 font-bold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && <OverviewTab course={course} setActiveTab={setActiveTab} />}
      {activeTab === 'Resources' && <ResourcesTab course={course} courseId={courseId} />}
      {activeTab === 'Assignments' && <AssignmentsTab course={course} />}
      {activeTab === 'Quizzes' && <QuizzesTab course={course} />}
      {activeTab === 'Grades' && <GradesTab courseId={courseId} course={course} />}
    </div>
  );
}
