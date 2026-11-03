import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../components/ui/ProgressRing';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Plus, Users, BookOpen, Copy, Check, Edit2 } from 'lucide-react';
import { COURSE_ACCENTS } from '../../lib/utils';
import { listMyCourses, createCourse, updateCourse } from '../../lib/api/coursesApi';

export function ProfessorCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create course modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    description: '',
    section: 'Section 01',
  });
  const [createdCourse, setCreatedCourse] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit course modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editError, setEditError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setIsCreateModalOpen(true);
    }
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.courseName.trim()) return;
    setCreateError('');
    setIsCreating(true);
    try {
      const created = await createCourse({
        courseName: newCourse.courseName.trim(),
        description: newCourse.description.trim(),
        section: newCourse.section.trim() || 'Section 01',
      });
      setCreatedCourse(created);
      await fetchCourses();
    } catch (err) {
      setCreateError(err.message || 'Failed to create course');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCourse = (e, course) => {
    e.stopPropagation();
    setEditingCourse({
      courseId: course.courseId || course.id,
      courseName: course.courseName || course.title,
      description: course.description || '',
      section: course.section || 'Section 01',
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse.courseName.trim()) return;
    setEditError('');
    setIsUpdating(true);
    try {
      await updateCourse(editingCourse.courseId, {
        courseName: editingCourse.courseName.trim(),
        description: editingCourse.description.trim(),
        section: editingCourse.section.trim() || 'Section 01',
      });
      setIsEditModalOpen(false);
      setEditingCourse(null);
      await fetchCourses();
    } catch (err) {
      setEditError(err.message || 'Failed to update course');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreatedCourse(null);
    setNewCourse({ courseName: '', description: '', section: 'Section 01' });
    setIsCopied(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">
            My Courses
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Manage your courses, syllabi, enrolled students, and class codes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setCreateError('');
            setCreatedCourse(null);
            setIsCreateModalOpen(true);
          }}
          className="font-bold text-xs"
        >
          Create course
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-ink-muted">Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink-border p-12 text-center shadow-soft space-y-3">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-ink">No courses created yet</h3>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            You haven&apos;t created any courses yet. Create your first course to generate a class code for students to join.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            className="mx-auto font-bold text-xs"
          >
            Create your first course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const courseId = course.courseId || course.id;
            const accentKeys = ['violet', 'emerald', 'blue', 'coral'];
            const accentKey = accentKeys[idx % accentKeys.length];
            const accent = COURSE_ACCENTS[accentKey] || COURSE_ACCENTS.violet;

            return (
              <div
                key={courseId}
                onClick={() => navigate(`/professor/courses/${courseId}`)}
                className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft hover:shadow-card hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${accent.tile}`}>
                      {course.section || 'Section 01'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        Code: {course.courseCode || course.classCode}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleEditCourse(e, course)}
                        title="Edit course"
                        className="p-1 rounded text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-ink group-hover:text-brand-600 transition-colors mb-1">
                    {course.courseName || course.title}
                  </h3>
                  <p className="text-xs text-ink-muted mb-4">{course.section}</p>

                  <div className="space-y-2 text-xs text-ink-muted mb-6 bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Enrolled Students
                      </span>
                      <span className="font-bold text-ink">{course.enrollmentCount ?? course.enrolled ?? 0}</span>
                    </div>
                    {course.description && (
                      <div className="text-[11px] text-ink-muted line-clamp-2">
                        {course.description}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-ink-muted uppercase tracking-wider text-[10px]">
                      STATUS
                    </span>
                    <span className="text-ink text-xs">Active</span>
                  </div>
                  <ProgressBar value={100} color={accent.bar} height="h-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title={createdCourse ? 'Course Created Successfully!' : 'Create New Course'}
        description={
          createdCourse
            ? 'Share this class code with your students to let them join.'
            : 'Add a new academic course to your teaching workspace.'
        }
      >
        {createdCourse ? (
          <div className="space-y-5 py-4 text-center">
            <div className="p-6 bg-brand-50 rounded-2xl border border-brand-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Class Join Code
              </span>
              <div className="text-4xl font-mono font-extrabold tracking-widest text-ink">
                {createdCourse.courseCode}
              </div>
              <p className="text-xs text-ink-muted">
                Students can use this 6-character code to enroll into {createdCourse.courseName}.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={isCopied ? Check : Copy}
                onClick={() => copyToClipboard(createdCourse.courseCode)}
                className="font-bold text-xs"
              >
                {isCopied ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={closeCreateModal}
                className="font-bold text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCourse} className="space-y-4 pt-2">
            {createError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {createError}
              </div>
            )}

            <Input
              label="Course Name"
              placeholder="e.g. Data Structures & Algorithms"
              required
              value={newCourse.courseName}
              onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
            />
            <Input
              label="Section"
              placeholder="e.g. Section 01"
              value={newCourse.section}
              onChange={(e) => setNewCourse({ ...newCourse, section: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Course outline and curriculum overview..."
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="w-full bg-white border border-ink-border rounded-lg text-xs text-ink p-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={closeCreateModal}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isCreating}
                className="font-bold"
              >
                Create course
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Course Modal */}
      {editingCourse && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Course Details"
          description="Update course title, section, or description."
        >
          <form onSubmit={handleUpdateCourse} className="space-y-4 pt-2">
            {editError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {editError}
              </div>
            )}

            <Input
              label="Course Name"
              required
              value={editingCourse.courseName}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, courseName: e.target.value })
              }
            />
            <Input
              label="Section"
              value={editingCourse.section}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, section: e.target.value })
              }
            />
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={editingCourse.description}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, description: e.target.value })
                }
                className="w-full bg-white border border-ink-border rounded-lg text-xs text-ink p-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isUpdating}
                className="font-bold"
              >
                Save changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
