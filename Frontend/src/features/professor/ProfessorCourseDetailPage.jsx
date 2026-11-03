import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';
import { StudentsTab } from './course-tabs/StudentsTab';
import { ResourcesTab } from './course-tabs/ResourcesTab';
import { AssignmentsTab } from './course-tabs/AssignmentsTab';
import { QuizzesTab } from './course-tabs/QuizzesTab';
import { getCourse } from '../../lib/api/coursesApi';

export function ProfessorCourseDetailPage() {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('Students');
  const [course, setCourse] = useState({
    id: courseId,
    title: 'Loading...',
    code: '...',
    section: 'Section 01',
    enrolledCount: 0,
  });

  useEffect(() => {
    if (!courseId) return;
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
            enrolledCount: data.enrollmentCount ?? 0,
            description: data.description,
          });
        }
      })
      .catch((err) => console.error('Failed to get professor course:', err));
  }, [courseId]);

  const tabs = ['Students', 'Resources', 'Assignments', 'Quizzes'];

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs text-ink-muted mb-1">
          <Link to="/professor/courses" className="hover:text-brand-600">
            Courses
          </Link>
          <span>/</span>
          <span className="text-ink font-semibold">{course.code}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">
            {course.title}
          </h1>
          <span className="text-xs font-semibold text-ink-muted">
            {course.code} · {course.section}
          </span>
        </div>
      </div>

      {/* Dark Navy Header Card */}
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
            <p className="text-xs text-slate-300 font-normal">Instructor Dashboard & Administration</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-navy-800/80 px-4 py-3 rounded-2xl border border-navy-700/60">
          <Users className="w-5 h-5 text-violet-400" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ENROLLED STUDENTS</p>
            <p className="text-lg font-bold text-white">{course.enrolledCount}</p>
          </div>
        </div>
      </div>

      {/* Sub-nav Tabs */}
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

      {/* Tab Panels */}
      {activeTab === 'Students' && <StudentsTab courseId={courseId} course={course} />}
      {activeTab === 'Resources' && <ResourcesTab courseId={courseId} course={course} />}
      {activeTab === 'Assignments' && <AssignmentsTab courseId={courseId} course={course} />}
      {activeTab === 'Quizzes' && <QuizzesTab courseId={courseId} course={course} />}
    </div>
  );
}
