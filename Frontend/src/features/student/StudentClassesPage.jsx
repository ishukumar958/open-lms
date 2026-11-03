import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../components/ui/ProgressRing';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Search, Plus, BookOpen, Clock, Users, LogOut } from 'lucide-react';
import { COURSE_ACCENTS } from '../../lib/utils';
import { listMyCourses, joinCourse, leaveCourse } from '../../lib/api/coursesApi';

export function StudentClassesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await listMyCourses();
      setCourses(data || []);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinError('');
    setIsJoining(true);
    try {
      await joinCourse({ courseCode: joinCode.trim() });
      setIsJoinModalOpen(false);
      setJoinCode('');
      await fetchCourses();
    } catch (err) {
      setJoinError(err.message || 'Failed to join class');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClass = async (e, courseId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to leave this class?')) return;
    try {
      await leaveCourse(courseId);
      await fetchCourses();
    } catch (err) {
      alert(err.message || 'Failed to leave class');
    }
  };

  const filtered = courses.filter((c) => {
    const title = c.courseName || c.title || '';
    const code = c.courseCode || c.code || '';
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">My Classes</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            You are enrolled in {courses.length} active courses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-muted" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs py-2 pl-8 pr-3 rounded-xl border border-ink-border focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setJoinError('');
              setJoinCode('');
              setIsJoinModalOpen(true);
            }}
            className="font-bold text-xs"
          >
            Join class
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-ink-muted">Loading your classes...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink-border p-12 text-center shadow-soft space-y-3">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-ink">No classes found</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            You are not enrolled in any classes yet. Click &quot;Join class&quot; and enter your 6-character class code to get started.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsJoinModalOpen(true)}
            className="mx-auto font-bold text-xs"
          >
            Join your first class
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, idx) => {
            const courseId = course.courseId || course.id;
            const accentKeys = ['violet', 'coral', 'blue', 'emerald'];
            const accentKey = accentKeys[idx % accentKeys.length];
            const accent = COURSE_ACCENTS[accentKey] || COURSE_ACCENTS.violet;

            return (
              <div
                key={courseId}
                onClick={() => navigate(`/student/classes/${courseId}`)}
                className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft hover:shadow-card hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${accent.tile}`}>
                      {course.courseCode || course.code}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleLeaveClass(e, courseId)}
                      title="Leave class"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-ink group-hover:text-brand-600 transition-colors mb-1">
                    {course.courseName || course.title}
                  </h3>
                  <p className="text-xs text-ink-muted mb-4">
                    {course.professorName || course.instructor || 'Instructor'} · {course.section || 'Section 01'}
                  </p>

                  <div className="space-y-1.5 text-xs text-ink-muted mb-6 bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-brand-500" />
                      <span>{course.enrollmentCount ?? 0} Students enrolled</span>
                    </div>
                    {course.description && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{course.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-ink-muted uppercase tracking-wider text-[10px]">
                      CLASS ACCESS
                    </span>
                    <span className="text-xs text-brand-600 font-semibold">Active</span>
                  </div>
                  <ProgressBar value={100} color={accent.bar} height="h-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Join Class Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title="Join a Class"
        description="Enter the 6-character class code provided by your instructor."
      >
        <form onSubmit={handleJoinClass} className="space-y-4 pt-2">
          {joinError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {joinError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Class Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. K7M2QX"
              required
              className="w-full text-center tracking-widest text-2xl font-mono font-bold uppercase py-3 border border-ink-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsJoinModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isJoining}
              className="font-bold"
            >
              Join class
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
