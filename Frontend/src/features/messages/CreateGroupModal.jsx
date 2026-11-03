import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Search, Users, Sparkles, Check, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { listMyCourses } from '../../lib/api/coursesApi';
import { getCourseEnrolledStudents, createGroup } from '../../lib/api/chatApi';

const PRESET_AVATARS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', color: 'indigo' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', color: 'emerald' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', color: 'amber' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500', color: 'coral' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-500', color: 'violet' },
  { id: 'sky', label: 'Sky', bg: 'bg-sky-500', color: 'blue' },
];

export function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('indigo');
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load teacher's courses
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setLoadingCourses(true);
    listMyCourses()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourseId(String(list[0].courseId));
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load your courses');
      })
      .finally(() => setLoadingCourses(false));
  }, [isOpen]);

  // Load students for selected course
  useEffect(() => {
    if (!selectedCourseId) {
      setEnrolledStudents([]);
      setSelectedStudentIds([]);
      return;
    }
    setLoadingStudents(true);
    setError(null);
    getCourseEnrolledStudents(selectedCourseId)
      .then((students) => {
        const list = Array.isArray(students) ? students : [];
        setEnrolledStudents(list);
        // Pre-select all enrolled students by default
        setSelectedStudentIds(list.map((s) => s.userId));
      })
      .catch((err) => {
        setError(err.message || 'Failed to load enrolled students');
        setEnrolledStudents([]);
      })
      .finally(() => setLoadingStudents(false));
  }, [selectedCourseId]);

  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === enrolledStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(enrolledStudents.map((s) => s.userId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    if (!selectedCourseId) {
      setError('Please select a course');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        groupName: groupName.trim(),
        description: description.trim() || null,
        courseId: Number(selectedCourseId),
        studentIds: selectedStudentIds,
        groupImage: customImageUrl.trim() || selectedAvatar,
      };

      const newGroup = await createGroup(payload);
      onGroupCreated(newGroup);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = enrolledStudents.filter((s) =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Course Chat Group"
      description="Create a teacher-controlled group chat with enrolled students."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 mt-2">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Select Course */}
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            1. Select Course <span className="text-red-500">*</span>
          </label>
          {loadingCourses ? (
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <div className="relative">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-ink-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium appearance-none"
              >
                {courses.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.courseCode} · {c.courseName} ({c.section || 'Sec 01'})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted">
                <Layers className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* 2. Group Name & Description */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              2. Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. CS-301 DSA Project Discussions"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={150}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-ink-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Purpose of this group, office hours, or discussion topics..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-ink-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* 3. Group Color / Preset */}
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
            3. Group Color Badge
          </label>
          <div className="flex items-center gap-2.5">
            {PRESET_AVATARS.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedAvatar(p.id)}
                className={`w-8 h-8 rounded-full ${p.bg} flex items-center justify-center transition-transform ${
                  selectedAvatar === p.id ? 'ring-2 ring-offset-2 ring-brand-500 scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {selectedAvatar === p.id && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Enrolled Students Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-600" />
              4. Select Students ({selectedStudentIds.length}/{enrolledStudents.length} selected)
            </label>
            {enrolledStudents.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-brand-600 font-semibold hover:text-brand-700 transition-colors"
              >
                {selectedStudentIds.length === enrolledStudents.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {loadingStudents ? (
            <div className="h-28 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-ink-muted">
              Loading enrolled students...
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-ink-border text-center text-xs text-ink-muted">
              No students currently enrolled in this course. You can still create the group and add students later.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Filter enrolled students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-ink-border rounded-lg text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 border border-ink-border/50 rounded-xl p-2 bg-slate-50/50">
                {filteredStudents.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.userId);
                  return (
                    <div
                      key={s.userId}
                      onClick={() => handleToggleStudent(s.userId)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        isChecked ? 'bg-brand-50/80 border border-brand-200' : 'bg-white hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                        />
                        <Avatar name={s.name} size="xs" color="brand" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-ink truncate">{s.name}</p>
                          <p className="text-[11px] text-ink-muted truncate">{s.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Enrolled
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-border">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitting}
            disabled={!groupName.trim() || submitting}
          >
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}
