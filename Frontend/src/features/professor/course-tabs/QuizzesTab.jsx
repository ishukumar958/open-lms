import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import {
  listCourseQuizzes,
  createQuiz,
  deleteQuiz,
  listQuizAttempts,
} from '../../../lib/api/quizzesApi';
import {
  Plus,
  Trash2,
  Users,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export function QuizzesTab({ courseId, course }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Quiz Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('20');
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      marks: 2,
      options: [
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
      ],
    },
  ]);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // View Attempts Modal State
  const [activeQuizForAttempts, setActiveQuizForAttempts] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  const fetchQuizzes = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const data = await listCourseQuizzes(courseId);
      setQuizzes(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await deleteQuiz(quizId);
      await fetchQuizzes();
    } catch (err) {
      alert(err.message || 'Cannot delete quiz that already has student attempts.');
    }
  };

  const handleOpenAttempts = async (quiz) => {
    setActiveQuizForAttempts(quiz);
    setLoadingAttempts(true);
    try {
      const data = await listQuizAttempts(quiz.quizId);
      setAttempts(data || []);
    } catch (err) {
      console.error('Failed to load quiz attempts:', err);
      setAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  // Dynamic question operations
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        marks: 2,
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (qIdx) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== qIdx));
  };

  const updateQuestionText = (qIdx, text) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].questionText = text;
      return copy;
    });
  };

  const updateQuestionMarks = (qIdx, marks) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].marks = Number(marks) || 1;
      return copy;
    });
  };

  const addOption = (qIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIdx].options.length >= 6) return copy;
      copy[qIdx].options.push({ optionText: '', isCorrect: false });
      return copy;
    });
  };

  const removeOption = (qIdx, oIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      if (copy[qIdx].options.length <= 2) return copy;
      const wasCorrect = copy[qIdx].options[oIdx].isCorrect;
      copy[qIdx].options = copy[qIdx].options.filter((_, idx) => idx !== oIdx);
      if (wasCorrect && copy[qIdx].options.length > 0) {
        copy[qIdx].options[0].isCorrect = true;
      }
      return copy;
    });
  };

  const updateOptionText = (qIdx, oIdx, text) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].options[oIdx].optionText = text;
      return copy;
    });
  };

  const setCorrectOption = (qIdx, oIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].options = copy[qIdx].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === oIdx,
      }));
      return copy;
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || title.length < 3) {
      setFormError('Quiz title must be at least 3 characters.');
      return;
    }

    if (questions.length === 0) {
      setFormError('Quiz must contain at least 1 question.');
      return;
    }

    let calculatedTotalMarks = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setFormError(`Question ${i + 1} is missing question text.`);
        return;
      }
      if (!q.marks || q.marks < 1) {
        setFormError(`Question ${i + 1} must have at least 1 mark.`);
        return;
      }
      calculatedTotalMarks += q.marks;

      if (q.options.length < 2) {
        setFormError(`Question ${i + 1} must have at least 2 options.`);
        return;
      }

      let correctCount = 0;
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].optionText.trim()) {
          setFormError(`Question ${i + 1}, option ${j + 1} cannot be blank.`);
          return;
        }
        if (q.options[j].isCorrect) correctCount++;
      }

      if (correctCount !== 1) {
        setFormError(`Question ${i + 1} must have exactly one correct option selected.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        totalMarks: calculatedTotalMarks,
        questions: questions.map((q) => ({
          questionText: q.questionText.trim(),
          marks: q.marks,
          options: q.options.map((opt) => ({
            optionText: opt.optionText.trim(),
            isCorrect: opt.isCorrect,
          })),
        })),
      };

      await createQuiz(courseId, payload);
      setIsCreateModalOpen(false);
      // Reset form
      setTitle('');
      setDurationMinutes('20');
      setQuestions([
        {
          questionText: '',
          marks: 2,
          options: [
            { optionText: '', isCorrect: true },
            { optionText: '', isCorrect: false },
          ],
        },
      ]);
      await fetchQuizzes();
    } catch (err) {
      console.error('Failed to create quiz:', err);
      setFormError(err.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-ink">Quizzes & Assessments</h3>
          <p className="text-xs text-ink-muted">Create multiple choice quizzes with auto-grading.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Quiz
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-ink-muted">Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-ink">No quizzes created yet</p>
          <p className="text-[11px] text-ink-muted mt-0.5 mb-3">
            Publish your first quiz to begin assessing enrolled students.
          </p>
          <Button
            variant="outline"
            size="xs"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Quiz
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.quizId}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-ink-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {quiz.durationMinutes ? `${quiz.durationMinutes} mins` : 'Untimed'}
                  </span>
                  <Badge variant="default" size="xs">
                    {quiz.questionCount ?? quiz.questions?.length ?? 0} questions
                  </Badge>
                  <Badge variant="brand" size="xs">
                    {quiz.totalMarks} marks
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-ink">{quiz.title}</h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="xs"
                  icon={Users}
                  onClick={() => handleOpenAttempts(quiz)}
                >
                  Attempts
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  icon={Trash2}
                  onClick={() => handleDelete(quiz.quizId)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Quiz"
        description="Set up title, duration, questions and answer options."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-5 pt-2">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-ink">Quiz Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Midterm Assessment 1"
                className="w-full px-3 py-2 text-xs rounded-xl border border-ink-border focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Duration (mins)</label>
              <input
                type="number"
                min="1"
                max="300"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Leave blank for untimed"
                className="w-full px-3 py-2 text-xs rounded-xl border border-ink-border focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Questions Builder */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                Questions ({questions.length})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="xs"
                icon={Plus}
                onClick={addQuestion}
              >
                Add Question
              </Button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">
                      Question {qIdx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-ink-muted">Marks:</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={q.marks}
                        onChange={(e) => updateQuestionMarks(qIdx, e.target.value)}
                        className="w-14 px-2 py-1 text-xs rounded-lg border border-ink-border bg-white"
                      />
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          className="text-xs text-rose-500 hover:text-rose-700 ml-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    value={q.questionText}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    placeholder="Enter question text here..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-ink-muted font-semibold">
                      <span>Options (select radio for the correct option)</span>
                      {q.options.length < 6 && (
                        <button
                          type="button"
                          onClick={() => addOption(qIdx)}
                          className="text-brand-600 hover:underline"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>

                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={opt.isCorrect}
                          onChange={() => setCorrectOption(qIdx, oIdx)}
                          className="w-4 h-4 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                        <input
                          type="text"
                          required
                          value={opt.optionText}
                          onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIdx, oIdx)}
                            className="text-[11px] text-slate-400 hover:text-rose-600 px-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Attempts Modal */}
      <Modal
        isOpen={Boolean(activeQuizForAttempts)}
        onClose={() => setActiveQuizForAttempts(null)}
        title={`Student Attempts: ${activeQuizForAttempts?.title || ''}`}
        description="Recorded submissions and automated scores for this quiz."
        maxWidth="max-w-xl"
      >
        <div className="pt-2">
          {loadingAttempts ? (
            <div className="p-6 text-center text-xs text-ink-muted">Loading attempts...</div>
          ) : attempts.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-muted bg-slate-50 rounded-xl">
              No students have attempted this quiz yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {attempts.map((att) => {
                const date = att.submittedAt ? new Date(att.submittedAt).toLocaleString() : 'In Progress';
                return (
                  <div key={att.attemptId} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-ink">{att.studentName || `Student #${att.studentId}`}</p>
                      <p className="text-[11px] text-ink-muted">{att.studentEmail} · {date}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700">
                        {att.score} / {att.totalMarks}
                      </span>
                      <p className="text-[10px] text-ink-muted">{att.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveQuizForAttempts(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
