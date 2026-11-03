import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { CompletionCertificateModal } from '../../../components/ui/CompletionCertificateModal';
import { listCourseQuizzes, startQuizAttempt } from '../../../lib/api/quizzesApi';
import { useAuthStore } from '../../../store/authStore';
import { CheckCircle2, Clock, HelpCircle, Play, RotateCcw } from 'lucide-react';

export function QuizzesTab({ course }) {
  const navigate = useNavigate();
  const courseId = course?.courseId || course?.id;
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingQuizId, setStartingQuizId] = useState(null);
  const [certificateQuiz, setCertificateQuiz] = useState(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    setLoading(true);
    listCourseQuizzes(courseId)
      .then((data) => {
        if (mounted) {
          setQuizzes(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load quizzes:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [courseId]);

  const handleStart = async (quizId) => {
    try {
      setStartingQuizId(quizId);
      await startQuizAttempt(quizId);
      navigate(`/student/classes/${courseId}/quizzes/${quizId}`);
    } catch (err) {
      console.error('Failed to start quiz attempt:', err);
      // Navigate anyway in case attempt is already active
      navigate(`/student/classes/${courseId}/quizzes/${quizId}`);
    } finally {
      setStartingQuizId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-ink">Course Quizzes & Assessments</h3>
          <p className="text-xs text-ink-muted">Test your knowledge and track your mastery.</p>
        </div>
        <span className="text-xs font-semibold text-ink-muted">
          {quizzes.length} Assessment{quizzes.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-ink-muted">Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="p-8 text-center text-xs text-ink-muted bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No quizzes configured for this course yet.
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => {
            const attempt = quiz.myAttempt;
            const isCompleted = attempt && attempt.status === 'SUBMITTED';
            const isInProgress = attempt && attempt.status === 'IN_PROGRESS';
            const durationLabel = quiz.durationMinutes
              ? `${quiz.durationMinutes} minutes`
              : 'Untimed';

            return (
              <div
                key={quiz.quizId}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isCompleted ? (
                      <Badge variant="success" size="xs">
                        Completed
                      </Badge>
                    ) : isInProgress ? (
                      <Badge variant="amber" size="xs">
                        In Progress
                      </Badge>
                    ) : (
                      <Badge variant="default" size="xs">
                        Available
                      </Badge>
                    )}
                    <span className="text-[11px] text-ink-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {durationLabel}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-ink">{quiz.title}</h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {quiz.questionCount ?? quiz.questions?.length ?? 0} questions · {quiz.totalMarks} points
                    {isCompleted && (
                      <strong className="text-emerald-700 ml-2 font-semibold">
                        Score: {attempt.score} / {quiz.totalMarks} ({Math.round((attempt.score / quiz.totalMarks) * 100)}%)
                      </strong>
                    )}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isCompleted ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/student/classes/${courseId}/quizzes/${quiz.quizId}`)}
                      >
                        Review Answers
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setCertificateQuiz({
                          ...quiz,
                          score: attempt.score,
                          submittedAt: attempt.submittedAt,
                        })}
                      >
                        View certificate
                      </Button>
                    </>
                  ) : isInProgress ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/student/classes/${courseId}/quizzes/${quiz.quizId}`)}
                      icon={RotateCcw}
                    >
                      Resume Quiz
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={startingQuizId === quiz.quizId}
                      onClick={() => handleStart(quiz.quizId)}
                      icon={Play}
                    >
                      {startingQuizId === quiz.quizId ? 'Starting...' : 'Start Quiz'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CompletionCertificateModal
        isOpen={Boolean(certificateQuiz)}
        onClose={() => setCertificateQuiz(null)}
        studentName={user?.name}
        courseName={course?.courseName || course?.title}
        courseCode={course?.courseCode}
        quiz={certificateQuiz}
        submittedAt={certificateQuiz?.submittedAt}
      />
    </div>
  );
}
