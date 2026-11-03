import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listSubmissions, gradeSubmission } from '../../lib/api/submissionsApi';
import { listMyCourses } from '../../lib/api/coursesApi';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Clock,
  Inbox,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function SubmissionsGradingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';
  const initialAssignmentId = searchParams.get('assignmentId') || '';

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  // Grading form state
  const [gradeStatus, setGradeStatus] = useState('APPROVED');
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Load courses
  useEffect(() => {
    listMyCourses()
      .then((data) => setCourses(data || []))
      .catch((err) => console.error('Failed to load professor courses:', err));
  }, []);

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCourseId) params.courseId = selectedCourseId;
      if (selectedStatus && selectedStatus !== 'ALL') params.status = selectedStatus;
      const data = await listSubmissions(params);
      setSubmissions(data || []);

      if (data && data.length > 0) {
        // If initial assignment filter was provided, pick first from that assignment
        if (initialAssignmentId) {
          const match = data.find((s) => String(s.assignmentId) === String(initialAssignmentId));
          if (match) {
            setSelectedSubmissionId(match.submissionId);
            setGradeStatus(match.status === 'REJECTED' ? 'REJECTED' : 'APPROVED');
            setMarks(match.marksObtained != null ? String(match.marksObtained) : '');
            setFeedback(match.feedback || '');
            return;
          }
        }
        if (!selectedSubmissionId || !data.some((s) => s.submissionId === selectedSubmissionId)) {
          setSelectedSubmissionId(data[0].submissionId);
          setGradeStatus(data[0].status === 'REJECTED' ? 'REJECTED' : 'APPROVED');
          setMarks(data[0].marksObtained != null ? String(data[0].marksObtained) : '');
          setFeedback(data[0].feedback || '');
        }
      } else {
        setSelectedSubmissionId(null);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedCourseId, selectedStatus]);

  const currentSubmission = submissions.find((s) => s.submissionId === selectedSubmissionId);

  const handleSelectSubmission = (s) => {
    setSelectedSubmissionId(s.submissionId);
    setGradeStatus(s.status === 'REJECTED' ? 'REJECTED' : 'APPROVED');
    setMarks(s.marksObtained != null ? String(s.marksObtained) : '');
    setFeedback(s.feedback || '');
    setGradeError(null);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!currentSubmission) return;
    setGradeError(null);

    const marksNum = gradeStatus === 'APPROVED' ? Number(marks) : null;
    if (gradeStatus === 'APPROVED') {
      if (marks === '' || isNaN(marksNum) || marksNum < 0) {
        setGradeError('Marks obtained is required and must be 0 or greater.');
        return;
      }
      if (currentSubmission.maxMarks && marksNum > currentSubmission.maxMarks) {
        setGradeError(`Marks cannot exceed maximum marks (${currentSubmission.maxMarks}).`);
        return;
      }
    }

    if (!feedback.trim()) {
      setGradeError('Feedback is required.');
      return;
    }

    setGrading(true);
    try {
      await gradeSubmission(currentSubmission.submissionId, {
        status: gradeStatus,
        marks: marksNum,
        feedback: feedback.trim(),
      });
      setIsSuccessModalOpen(true);
      await fetchSubmissions();
    } catch (err) {
      console.error('Failed to grade submission:', err);
      setGradeError(err.message || 'Failed to grade submission.');
    } finally {
      setGrading(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.studentName && s.studentName.toLowerCase().includes(q)) ||
      (s.assignmentTitle && s.assignmentTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Submissions & Grading</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Review student responses, enter marks, and return feedback.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-ink-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.courseId} value={c.courseId}>
                {c.courseCode} · {c.courseName}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-ink-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Needs Review (SUBMITTED)</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (5 cols): Submissions List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-ink-border shadow-soft overflow-hidden">
          <div className="p-3 border-b border-ink-border bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or assignment..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-ink-muted">Loading submissions...</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-10 text-center text-xs text-ink-muted">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No submissions match the current filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[calc(100vh-280px)] overflow-y-auto">
              {filteredSubmissions.map((s) => {
                const isSelected = s.submissionId === selectedSubmissionId;
                const date = s.submittedAt ? new Date(s.submittedAt) : null;
                const timeLabel = date
                  ? `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Submitted';

                return (
                  <div
                    key={s.submissionId}
                    onClick={() => handleSelectSubmission(s)}
                    className={cn(
                      'p-4 transition-colors cursor-pointer flex items-start justify-between gap-3',
                      isSelected
                        ? 'bg-brand-50/70 border-l-4 border-l-brand-600'
                        : 'hover:bg-slate-50/80'
                    )}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Avatar
                          initials={
                            s.studentName
                              ? s.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2)
                              : 'ST'
                          }
                          size="xs"
                          color="brand"
                        />
                        <h4 className="text-xs font-bold text-ink truncate">{s.studentName}</h4>
                      </div>
                      <p className="text-xs font-semibold text-brand-700 truncate">
                        {s.assignmentTitle}
                      </p>
                      <p className="text-[10px] text-ink-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeLabel}
                      </p>
                    </div>

                    <Badge
                      variant={
                        s.status === 'APPROVED'
                          ? 'success'
                          : s.status === 'REJECTED'
                          ? 'rose'
                          : 'amber'
                      }
                      size="xs"
                      className="shrink-0"
                    >
                      {s.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right (7 cols): Grading Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-6">
          {!currentSubmission ? (
            <div className="py-16 text-center text-xs text-ink-muted">
              Select a submission from the list to review and grade.
            </div>
          ) : (
            <>
              {/* Submission Details Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                    {currentSubmission.courseName || `Course #${currentSubmission.courseId}`}
                  </span>
                  <h2 className="text-base font-bold text-ink mt-0.5">
                    {currentSubmission.assignmentTitle}
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Submitted by <strong>{currentSubmission.studentName}</strong> ({currentSubmission.studentEmail})
                  </p>
                </div>

                <Badge
                  variant={
                    currentSubmission.status === 'APPROVED'
                      ? 'success'
                      : currentSubmission.status === 'REJECTED'
                      ? 'rose'
                      : 'amber'
                  }
                  size="sm"
                >
                  {currentSubmission.status}
                </Badge>
              </div>

              {/* Student Response Content */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Student Submission Content
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-ink leading-relaxed whitespace-pre-wrap min-h-24">
                  {currentSubmission.submissionText || (
                    <span className="text-ink-muted italic">No text provided.</span>
                  )}
                </div>

                {currentSubmission.fileUrl && (
                  <div className="pt-1">
                    <a
                      href={currentSubmission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-brand-700 border border-violet-200 text-xs font-semibold hover:bg-violet-100 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Attachment Link
                    </a>
                  </div>
                )}
              </div>

              {/* Grading Form */}
              <form onSubmit={handleGradeSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Evaluation & Feedback
                </h4>

                {gradeError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{gradeError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">Decision Status</label>
                    <select
                      value={gradeStatus}
                      onChange={(e) => setGradeStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                    >
                      <option value="APPROVED">Approve (Award Marks)</option>
                      <option value="REJECTED">Reject (Request Resubmission)</option>
                    </select>
                  </div>

                  {gradeStatus === 'APPROVED' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink">
                        Marks Obtained {currentSubmission.maxMarks ? `(out of ${currentSubmission.maxMarks})` : ''}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={currentSubmission.maxMarks || 1000}
                        required
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        placeholder="e.g., 85"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">Instructor Feedback</label>
                  <textarea
                    rows={4}
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for the student..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="submit"
                    variant={gradeStatus === 'APPROVED' ? 'primary' : 'danger'}
                    size="md"
                    disabled={grading}
                    className="font-bold"
                  >
                    {grading
                      ? 'Saving Grade...'
                      : gradeStatus === 'APPROVED'
                      ? 'Approve & Save Grade'
                      : 'Reject Submission'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Grade Recorded"
        description="The submission was successfully evaluated and the student's grade record was updated."
      >
        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSuccessModalOpen(false)}
          >
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
}
