import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { listCourseAssignments } from '../../../lib/api/assignmentsApi';
import { submitAssignment } from '../../../lib/api/submissionsApi';
import { FileUploader } from '../../../components/ui/FileUploader';
import { Clock, Upload, CheckCircle2, AlertCircle, FileText, Paperclip, ExternalLink } from 'lucide-react';

export function AssignmentsTab({ course }) {
  const courseId = course?.courseId || course?.id;
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchAssignments = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const data = await listCourseAssignments(courseId);
      setAssignments(data || []);
    } catch (err) {
      console.error('Failed to load course assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    const prevSub = assignment.mySubmission;
    setSubmissionText(prevSub?.submissionText || '');
    setFileUrl(prevSub?.fileUrl || '');
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      await submitAssignment(selectedAssignment.assignmentId, {
        submissionText: submissionText.trim(),
        fileUrl: fileUrl.trim() || null,
      });
      setSuccessMessage('Submitted successfully!');
      setTimeout(() => {
        setSelectedAssignment(null);
        setSuccessMessage(null);
        fetchAssignments();
      }, 1000);
    } catch (err) {
      console.error('Failed to submit assignment:', err);
      setSubmitError(err.message || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-ink">Course Assignments</h3>
          <p className="text-xs text-ink-muted">Complete homework, lab reports, and projects.</p>
        </div>
        <span className="text-xs font-semibold text-ink-muted">
          {assignments.length} Total
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-ink-muted">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="p-8 text-center text-xs text-ink-muted bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No assignments published for this class yet.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const status = (a.studentStatus || a.myStatus || 'PENDING').toUpperCase();
            const sub = a.mySubmission;
            const dueDate = a.dueDate ? new Date(a.dueDate) : null;
            const dueLabel = dueDate
              ? dueDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'No due date';

            return (
              <div
                key={a.assignmentId}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        status === 'APPROVED'
                          ? 'success'
                          : status === 'REJECTED'
                          ? 'rose'
                          : status === 'SUBMITTED'
                          ? 'submitted'
                          : status === 'OVERDUE'
                          ? 'warning'
                          : 'default'
                      }
                      size="xs"
                    >
                      {status}
                    </Badge>
                    <span className="text-xs text-ink-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due {dueLabel} · {a.maxMarks || 100} pts
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-ink">{a.title}</h4>
                  {a.description && (
                    <p className="text-xs text-ink-muted line-clamp-1 max-w-xl">{a.description}</p>
                  )}

                  {a.attachmentUrl && (
                    <div className="pt-0.5">
                      <a
                        href={a.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        <Paperclip className="w-3 h-3" /> Assignment Handout
                      </a>
                    </div>
                  )}

                  {sub?.fileUrl && (
                    <div className="pt-0.5">
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-700 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Submitted File
                      </a>
                    </div>
                  )}

                  {sub && (status === 'APPROVED' || status === 'REJECTED') && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                      <p className={`font-semibold ${status === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {status === 'APPROVED' ? `Grade: ${sub.marksObtained ?? sub.marks ?? 0} / ${a.maxMarks || 100}` : 'Rejected'}
                      </p>
                      {sub.feedback && (
                        <p className="text-[11px] text-ink-muted italic">"{sub.feedback}"</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {status === 'APPROVED' ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Graded
                    </span>
                  ) : status === 'SUBMITTED' ? (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openSubmitModal(a)}
                    >
                      Update
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="xs"
                      icon={Upload}
                      onClick={() => openSubmitModal(a)}
                    >
                      {status === 'REJECTED' ? 'Resubmit' : 'Submit'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      <Modal
        isOpen={Boolean(selectedAssignment)}
        onClose={() => setSelectedAssignment(null)}
        title={
          selectedAssignment?.mySubmission
            ? `Resubmit: ${selectedAssignment?.title || ''}`
            : `Submit: ${selectedAssignment?.title || ''}`
        }
        description="Provide your answer text or an attachment URL for grading."
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink">Submission Response / Text</label>
            <textarea
              rows={4}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Type your notes, solution, or reflection here..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-ink-border focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink">Upload Solution File (Cloudinary)</label>
            <FileUploader
              folder="submissions"
              label="Upload report, code archive, or presentation (up to 10MB)"
              onUploadSuccess={(res) => setFileUrl(res.fileUrl || res.url)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink">Attachment URL (Optional)</label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-ink-border focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedAssignment(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Confirm Submission'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
