import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FileUploader } from '../../components/ui/FileUploader';
import { listMyAssignments } from '../../lib/api/assignmentsApi';
import { submitAssignment } from '../../lib/api/submissionsApi';
import { CheckCircle2, Clock, FileText, Upload, AlertCircle, ExternalLink, Paperclip } from 'lucide-react';

export function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todo');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await listMyAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

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
      setSuccessMessage('Assignment submitted successfully!');
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

  const getStatusKey = (a) => {
    const s = (a.studentStatus || a.myStatus || 'PENDING').toUpperCase();
    return s;
  };

  const filtered = assignments.filter((a) => {
    const s = getStatusKey(a);
    if (activeTab === 'todo') return s === 'PENDING' || s === 'OVERDUE' || s === 'REJECTED';
    if (activeTab === 'submitted') return s === 'SUBMITTED';
    if (activeTab === 'graded') return s === 'APPROVED';
    return true;
  });

  const todoCount = assignments.filter((a) => {
    const s = getStatusKey(a);
    return s === 'PENDING' || s === 'OVERDUE' || s === 'REJECTED';
  }).length;

  const gradedCount = assignments.filter((a) => getStatusKey(a) === 'APPROVED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Assignments</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Track and submit your coursework across all enrolled classes.
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-ink-border text-xs font-semibold">
          <button
            onClick={() => setActiveTab('todo')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'todo' ? 'bg-brand-500 text-white' : 'text-ink-muted hover:text-ink'
            }`}
          >
            To do ({todoCount})
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'submitted' ? 'bg-brand-500 text-white' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Submitted
          </button>
          <button
            onClick={() => setActiveTab('graded')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'graded' ? 'bg-brand-500 text-white' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Graded ({gradedCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'all' ? 'bg-brand-500 text-white' : 'text-ink-muted hover:text-ink'
            }`}
          >
            All ({assignments.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-muted bg-white rounded-2xl border border-ink-border">
          Loading assignments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-ink-muted bg-white rounded-2xl border border-dashed border-ink-border">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No assignments found in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const status = getStatusKey(a);
            const sub = a.mySubmission;
            const dueDate = a.dueDate ? new Date(a.dueDate) : null;
            const dueLabel = dueDate
              ? dueDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'No due date';

            return (
              <div
                key={a.assignmentId}
                className="p-5 rounded-2xl border border-ink-border bg-white shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                      {a.courseName || `Course #${a.courseId}`}
                    </span>
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
                  </div>

                  <h3 className="text-sm font-bold text-ink">{a.title}</h3>
                  {a.description && (
                    <p className="text-xs text-ink-muted line-clamp-2 max-w-2xl">{a.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-ink-muted pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due {dueLabel}
                    </span>
                    <span>·</span>
                    <span className="font-semibold">{a.maxMarks || a.maxPoints || 100} points max</span>
                  </div>

                  {a.attachmentUrl && (
                    <div className="pt-1">
                      <a
                        href={a.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 hover:underline font-medium"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Assignment Handout</span>
                      </a>
                    </div>
                  )}

                  {sub?.fileUrl && (
                    <div className="pt-0.5">
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Submitted File</span>
                      </a>
                    </div>
                  )}

                  {/* Feedback display if graded */}
                  {sub && (status === 'APPROVED' || status === 'REJECTED') && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className={status === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'}>
                          {status === 'APPROVED'
                            ? `Score: ${sub.marksObtained ?? sub.marks ?? 0} / ${a.maxMarks || 100}`
                            : 'Submission Rejected'}
                        </span>
                        {sub.submittedAt && (
                          <span className="text-[10px] text-ink-muted font-normal">
                            Graded for submission from {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {sub.feedback && (
                        <p className="text-ink-muted text-[11px] italic">
                          "{sub.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {status === 'APPROVED' ? (
                    <Badge variant="success" size="sm" className="font-semibold">
                      Completed
                    </Badge>
                  ) : status === 'SUBMITTED' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSubmitModal(a)}
                    >
                      Update Submission
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openSubmitModal(a)}
                      icon={Upload}
                    >
                      {status === 'REJECTED' ? 'Resubmit Assignment' : 'Submit Assignment'}
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
              label="Upload your report, code zip, or presentation (up to 10MB)"
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
            <p className="text-[10px] text-ink-muted">
              Link to your document, repository, or uploaded file.
            </p>
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
