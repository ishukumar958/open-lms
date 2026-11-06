import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { printCompletionCertificate } from '../../components/ui/CompletionCertificateModal';
import { formatTime, cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import {
  getQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getMyQuizAttempt,
} from '../../lib/api/quizzesApi';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Award,
  ChevronLeft,
  Printer,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export function QuizTakingPage() {
  const navigate = useNavigate();
  const { courseId, quizId } = useParams();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionId }
  const [flagged, setFlagged] = useState({}); // { [questionId]: boolean }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  const isInitialMount = useRef(true);

  // Load quiz and attempt state
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function init() {
      try {
        const quizData = await getQuiz(quizId);
        if (!mounted) return;
        setQuiz(quizData);
        setAnswers({});
        setFlagged({});
        setCurrentIdx(0);
        setReviewResult(null);
        setIsCertificateOpen(false);

        // Try starting or resuming attempt
        let attemptData = null;
        try {
          attemptData = await startQuizAttempt(quizId);
        } catch (startErr) {
          // If already submitted (409) or maximum attempts reached
          if (startErr.status === 409 || startErr.message?.includes('already') || startErr.message?.includes('Maximum')) {
            const myAttempt = await getMyQuizAttempt(quizId);
            if (mounted) {
              setAttempt(myAttempt);
              setReviewResult(myAttempt);
              const pct = Math.round(((myAttempt?.score || 0) / (myAttempt?.totalMarks || quizData?.totalMarks || 1)) * 100);
              setIsCertificateOpen(pct >= 50);
              setLoading(false);
            }
            return;
          } else {
            throw startErr;
          }
        }

        if (!mounted) return;
        setAttempt(attemptData);

        if (attemptData.status === 'SUBMITTED') {
          const myAttempt = await getMyQuizAttempt(quizId);
          if (mounted) {
            setReviewResult(myAttempt);
            const pct = Math.round(((myAttempt?.score || 0) / (myAttempt?.totalMarks || quizData?.totalMarks || 1)) * 100);
            setIsCertificateOpen(pct >= 50);
          }
        } else {
          // Reliable timeLeft calculation: NEVER let it be 0 on fresh start
          const durationMinutes = attemptData.durationMinutes || quizData.durationMinutes || 15;
          let calculatedSeconds = durationMinutes * 60;

          if (attemptData.startedAt && attemptData.endsAt) {
            const parseDate = (d) => {
              if (!d) return null;
              const s = String(d);
              return new Date(s.endsWith('Z') || /[+-]\d{2}(:\d{2})?$/.test(s) ? s : s + 'Z').getTime();
            };
            const startedMs = parseDate(attemptData.startedAt);
            const endsMs = parseDate(attemptData.endsAt) || (startedMs + durationMinutes * 60 * 1000);
            const nowMs = Date.now();
            const remainingSec = Math.floor((endsMs - nowMs) / 1000);

            // If remainingSec is a plausible active timer, use it
            if (remainingSec > 10 && remainingSec <= durationMinutes * 60 + 120) {
              calculatedSeconds = remainingSec;
            } else {
              calculatedSeconds = durationMinutes * 60;
            }
          }

          setTimeLeft(calculatedSeconds);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize quiz:', err);
        if (mounted) {
          setError(err.message || 'Failed to load quiz');
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (reviewResult || timeLeft === null) return;

    // Safety guard: do not auto-submit on the very first frame
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (timeLeft <= 0) {
        setTimeLeft((quiz?.durationMinutes || 15) * 60);
        return;
      }
    }

    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, reviewResult]);

  const questions = quiz?.questions || [];
  const currentQ = questions[currentIdx];

  const handleSelectOption = (optionId) => {
    if (reviewResult) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.questionId]: optionId,
    }));
  };

  const handleToggleFlag = () => {
    if (reviewResult) return;
    setFlagged((prev) => ({
      ...prev,
      [currentQ.questionId]: !prev[currentQ.questionId],
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else if (!reviewResult) {
      setIsSubmitModalOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (submitting || reviewResult) return;
    setSubmitting(true);
    setIsSubmitModalOpen(false);

    try {
      const payloadAnswers = Object.entries(answers).map(([qId, optId]) => ({
        questionId: Number(qId),
        selectedOptionId: Number(optId),
      }));

      const res = await submitQuizAttempt(quizId, { answers: payloadAnswers });
      setReviewResult(res);
      setAttempt(res);
      const pct = Math.round(((res.score || 0) / (res.totalMarks || quiz?.totalMarks || 1)) * 100);
      // ONLY give/open certificate if score is >= 50%
      setIsCertificateOpen(pct >= 50);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      try {
        const myAttempt = await getMyQuizAttempt(quizId);
        setReviewResult(myAttempt);
        const pct = Math.round(((myAttempt?.score || 0) / (myAttempt?.totalMarks || quiz?.totalMarks || 1)) * 100);
        setIsCertificateOpen(pct >= 50);
      } catch (e) {
        alert(err.message || 'Failed to submit quiz');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetakeQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      setReviewResult(null);
      setAnswers({});
      setFlagged({});
      setCurrentIdx(0);
      setIsCertificateOpen(false);

      const newAttempt = await startQuizAttempt(quizId);
      setAttempt(newAttempt);
      const durationMinutes = newAttempt.durationMinutes || quiz?.durationMinutes || 15;
      setTimeLeft(durationMinutes * 60);
      setLoading(false);
    } catch (err) {
      console.error('Failed to retake quiz:', err);
      alert(err.message || 'Unable to start retake attempt. Maximum attempts may be reached.');
      setLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSubmitModalOpen || isExitModalOpen || reviewResult) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key.toLowerCase() === 'f') handleToggleFlag();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, isSubmitModalOpen, isExitModalOpen, reviewResult, questions.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-6 text-sm text-ink-muted">
        Loading quiz session...
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-ink">Unable to open quiz</h2>
        <p className="text-xs text-ink-muted max-w-sm">{error || 'Quiz not found'}</p>
        <Button variant="primary" size="sm" onClick={() => navigate(`/student/classes/${courseId}`)}>
          Back to Class
        </Button>
      </div>
    );
  }

  const answeredCount = questions.filter((q) => answers[q.questionId] !== undefined).length;
  const flaggedCount = questions.filter((q) => flagged[q.questionId]).length;
  const remainingCount = questions.length - answeredCount;
  const progressPercent = questions.length > 0 ? Math.round(((currentIdx + 1) / questions.length) * 100) : 0;

  // Review helper for current question
  const reviewAnswer = reviewResult?.answers?.find((a) => a.questionId === currentQ?.questionId);
  const scorePercent = reviewResult
    ? Math.round(((reviewResult.score || 0) / (reviewResult.totalMarks || quiz.totalMarks || 1)) * 100)
    : 0;
  const isPassed = reviewResult ? scorePercent >= 50 : false;
  const maxAttempts = 2;
  const attemptsUsed = reviewResult?.attemptsUsed ?? (reviewResult ? 1 : 0);
  const attemptsLeft = reviewResult?.attemptsLeft ?? Math.max(0, maxAttempts - attemptsUsed);

  const handlePrintCertificate = () => {
    if (!isPassed) return;
    printCompletionCertificate({
      studentName: user?.name,
      courseName: quiz.courseName,
      courseCode: quiz.courseCode,
      quizTitle: quiz.title,
      score: reviewResult?.score,
      totalMarks: reviewResult?.totalMarks || quiz.totalMarks,
      submittedAt: reviewResult?.submittedAt,
    });
  };

  return (
    <div className="min-h-screen bg-page flex flex-col select-none">
      {/* Top Header */}
      <header className="h-16 px-6 sm:px-10 bg-white border-b border-ink-border sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="xs"
            icon={ChevronLeft}
            onClick={() => navigate(`/student/classes/${courseId}`)}
          >
            Exit
          </Button>
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-xs">
            OL
          </div>
          <span className="font-bold text-sm text-ink hidden sm:inline">Open LMS</span>
        </div>

        <div className="text-center">
          <h1 className="text-sm font-bold text-ink truncate max-w-xs sm:max-w-md">
            {quiz.title}
          </h1>
          <p className="text-[10px] text-ink-muted font-semibold">
            {questions.length} questions · {quiz.totalMarks} points
          </p>
        </div>

        <div className="flex items-center gap-4">
          {reviewResult ? (
            <Badge variant={isPassed ? 'success' : 'danger'} size="sm" className="font-bold">
              {isPassed ? 'Passed' : 'Failed'}: {reviewResult.score} / {reviewResult.totalMarks || quiz.totalMarks} ({scorePercent}%)
            </Badge>
          ) : timeLeft !== null ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-ink font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>TIME LEFT</span>
              <span className={timeLeft < 60 ? 'text-rose-600 animate-pulse' : 'text-brand-600'}>
                {formatTime(timeLeft)}
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-ink-muted">Untimed</span>
          )}

          {!reviewResult && (
            <button
              type="button"
              onClick={() => setIsExitModalOpen(true)}
              className="text-xs font-semibold text-ink-muted hover:text-danger transition-colors"
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* Review mode top banner */}
      {reviewResult && (
        <div
          className={cn(
            'border-b px-6 sm:px-10 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3',
            isPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          )}
        >
          <div className="flex items-center gap-3">
            {isPassed ? (
              <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <p className={cn('text-xs font-bold', isPassed ? 'text-emerald-900' : 'text-rose-900')}>
                {isPassed
                  ? `Assessment Passed · Final Score: ${reviewResult.score} / ${reviewResult.totalMarks || quiz.totalMarks} (${scorePercent}%)`
                  : `Assessment Failed · Final Score: ${reviewResult.score} / ${reviewResult.totalMarks || quiz.totalMarks} (${scorePercent}%)`}
              </p>
              <p className={cn('text-[11px]', isPassed ? 'text-emerald-700' : 'text-rose-700 font-medium')}>
                {isPassed
                  ? 'Congratulations! You scored 50% or higher and successfully passed.'
                  : attemptsLeft === 1
                  ? 'Passing grade is 50%. Certificate is not awarded. Only 1 attempt is left.'
                  : 'Passing grade is 50%. Certificate is not awarded. No attempts remaining.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPassed && (
              <Button
                variant="outline"
                size="sm"
                icon={ShieldCheck}
                onClick={() => setIsCertificateOpen(true)}
              >
                View certificate
              </Button>
            )}
            {!isPassed && attemptsLeft > 0 && (
              <Button
                variant="primary"
                size="sm"
                icon={RotateCcw}
                onClick={handleRetakeQuiz}
                className="bg-brand-600 hover:bg-brand-700 font-bold"
              >
                Retake Quiz (1 attempt left)
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/student/classes/${courseId}`)}
            >
              Back to Class
            </Button>
          </div>
        </div>
      )}

      {/* Progress Strip */}
      <div className="bg-white border-b border-ink-border px-6 sm:px-10 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-ink-muted font-semibold mb-1.5">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{progressPercent}% completed</span>
        </div>
        <div className="max-w-6xl mx-auto w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main 3-Pane Body */}
      {questions.length > 0 && currentQ && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Pane (3 cols): Navigator */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-ink-border p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">Questions</h3>
              <span className="text-xs text-ink-muted">
                {answeredCount}/{questions.length} answered
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = answers[q.questionId] !== undefined;
                const isFl = flagged[q.questionId];

                // Review state coloring
                let reviewClass = '';
                if (reviewResult && reviewResult.answers) {
                  const ans = reviewResult.answers.find((a) => a.questionId === q.questionId);
                  if (ans) {
                    reviewClass = ans.isCorrect
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300';
                  }
                }

                return (
                  <button
                    key={q.questionId}
                    onClick={() => setCurrentIdx(idx)}
                    className={cn(
                      'h-10 rounded-xl font-bold text-xs transition-all relative flex items-center justify-center',
                      isCurrent
                        ? 'ring-2 ring-brand-500 ring-offset-2'
                        : '',
                      reviewClass || (
                        isAnswered
                          ? 'bg-slate-200/90 text-slate-800 hover:bg-slate-300'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                      )
                    )}
                  >
                    {idx + 1}
                    {isFl && !reviewResult && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-ink-muted">
              {reviewResult ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                    <span>Correct</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                    <span>Incorrect / Missed</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-slate-300" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300" />
                    <span>Unanswered</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center Pane (6 cols): Question Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-ink-border p-7 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Question {currentIdx + 1} ({currentQ.marks} mark{currentQ.marks === 1 ? '' : 's'})
              </span>
              {!reviewResult && (
                <button
                  type="button"
                  onClick={handleToggleFlag}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
                    flagged[currentQ.questionId]
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-ink-muted hover:bg-slate-100'
                  )}
                >
                  <Flag
                    className={cn(
                      'w-3.5 h-3.5',
                      flagged[currentQ.questionId] ? 'fill-amber-600 text-amber-600' : ''
                    )}
                  />
                  <span>{flagged[currentQ.questionId] ? 'Flagged' : 'Flag question'}</span>
                </button>
              )}
            </div>

            <div className="text-base sm:text-lg font-bold text-ink leading-snug">
              {currentQ.questionText}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {(currentQ.options || []).map((opt, oIdx) => {
                const optLetter = String.fromCharCode(65 + oIdx);
                const isSelected = reviewResult
                  ? reviewAnswer?.selectedOptionId === opt.optionId
                  : answers[currentQ.questionId] === opt.optionId;
                const isCorrectOption = reviewResult && reviewAnswer?.correctOptionId === opt.optionId;

                let borderStyle = 'border-slate-200 hover:border-slate-300 bg-white';
                if (reviewResult) {
                  if (isCorrectOption) {
                    borderStyle = 'border-emerald-500 bg-emerald-50/70 font-semibold';
                  } else if (isSelected && !isCorrectOption) {
                    borderStyle = 'border-rose-400 bg-rose-50/70';
                  }
                } else if (isSelected) {
                  borderStyle = 'border-brand-500 bg-brand-50/50 shadow-xs';
                }

                return (
                  <div
                    key={opt.optionId}
                    onClick={() => handleSelectOption(opt.optionId)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all flex items-center justify-between group',
                      reviewResult ? 'cursor-default' : 'cursor-pointer',
                      borderStyle
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors',
                          isSelected
                            ? 'bg-brand-500 text-white'
                            : isCorrectOption
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {optLetter}
                      </span>
                      <span className="text-sm text-ink">{opt.optionText}</span>
                    </div>

                    {reviewResult ? (
                      isCorrectOption ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct Answer
                        </span>
                      ) : isSelected ? (
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Your Choice
                        </span>
                      ) : null
                    ) : (
                      isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                icon={ArrowLeft}
              >
                Previous
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                iconRight={ArrowRight}
              >
                {currentIdx === questions.length - 1
                  ? reviewResult
                    ? 'Finish Review'
                    : 'Review & submit'
                  : 'Next question'}
              </Button>
            </div>
          </div>

          {/* Right Pane (3 cols): Summary Card */}
          <div className="lg:col-span-3 bg-navy-900 text-white rounded-2xl p-6 shadow-card border border-navy-800 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">
                  {reviewResult ? 'Assessment summary' : 'Before you submit'}
                </h3>
                {reviewResult && (
                  <Badge variant={isPassed ? 'success' : 'danger'} size="xs" className="font-bold">
                    {isPassed ? 'PASSED (≥50%)' : 'FAILED (<50%)'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {reviewResult
                  ? isPassed
                    ? `You passed with ${reviewResult.score} out of ${reviewResult.totalMarks || quiz.totalMarks} possible marks (${scorePercent}%).`
                    : `You scored ${reviewResult.score} out of ${reviewResult.totalMarks || quiz.totalMarks} possible marks (${scorePercent}%). Passing score is 50%.`
                  : `You've answered ${answeredCount} of ${questions.length} questions. Unanswered questions will receive 0 marks.`}
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-navy-800">
                <span className="text-slate-400">Total Questions</span>
                <span className="font-bold text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-navy-800">
                <span className="text-slate-400">Answered</span>
                <span className="font-bold text-emerald-400">{answeredCount}</span>
              </div>
              {reviewResult && (
                <>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-navy-800">
                    <span className="text-slate-400">Result</span>
                    <span className={cn('font-bold', isPassed ? 'text-emerald-400' : 'text-rose-400')}>
                      {isPassed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-navy-800">
                    <span className="text-slate-400">Attempts</span>
                    <span className="font-bold text-slate-200">
                      {attemptsUsed} of {maxAttempts} used ({attemptsLeft} left)
                    </span>
                  </div>
                </>
              )}
              {!reviewResult && (
                <>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-navy-800">
                    <span className="text-slate-400">Flagged</span>
                    <span className="font-bold text-amber-400">{flaggedCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-navy-800">
                    <span className="text-slate-400">Remaining</span>
                    <span className="font-bold text-slate-300">{remainingCount}</span>
                  </div>
                </>
              )}
            </div>

            {reviewResult ? (
              <div className="space-y-2.5">
                {!isPassed && attemptsLeft > 0 && (
                  <Button
                    variant="primary"
                    size="md"
                    icon={RotateCcw}
                    onClick={handleRetakeQuiz}
                    className="w-full font-bold shadow-md bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Retake Quiz (1 attempt left)
                  </Button>
                )}
                {isPassed && (
                  <Button
                    variant="primary"
                    size="md"
                    icon={ShieldCheck}
                    onClick={() => setIsCertificateOpen(true)}
                    className="w-full font-bold shadow-md"
                  >
                    View Certificate
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate(`/student/classes/${courseId}`)}
                  className="w-full text-slate-200 hover:text-white border-navy-700 hover:bg-navy-800 font-semibold"
                >
                  Return to Course
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                disabled={submitting}
                onClick={() => setIsSubmitModalOpen(true)}
                className="w-full font-bold shadow-md"
              >
                {submitting ? 'Submitting...' : 'Submit quiz'}
              </Button>
            )}
          </div>
        </main>
      )}

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Ready to submit your quiz?"
        description="Once submitted, your answers will be graded immediately."
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-ink-muted">Answered:</span>
              <span className="font-bold text-emerald-600">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Unanswered:</span>
              <span className="font-bold text-rose-600">{remainingCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Flagged:</span>
              <span className="font-bold text-amber-600">{flaggedCount}</span>
            </div>
          </div>

          {remainingCount > 0 && (
            <p className="text-xs text-amber-700 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              ⚠️ Warning: You have {remainingCount} unanswered question(s).
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Return to quiz
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="font-bold"
            >
              {submitting ? 'Submitting...' : 'Confirm and submit'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Exit Quiz Modal */}
      <Modal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        title="Exit Quiz"
        description="Are you sure you want to exit? Your attempt timer will continue running."
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setIsExitModalOpen(false)}>
            Stay in quiz
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate(`/student/classes/${courseId}`)}
          >
            Exit to course
          </Button>
        </div>
      </Modal>

      {/* Certificate modal - strictly only if passed (>= 50%) */}
      {reviewResult && isPassed && (
        <Modal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          title="Certificate of completion"
          description="Your certificate is ready to print or save as a PDF."
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div
              id="completion-certificate"
              className="relative overflow-hidden rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-white via-brand-50/40 to-violet-50 p-6 sm:p-10 text-center"
            >
              <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-brand-100/60" />
              <div className="absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-violet-100/60" />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
                  <Award className="h-7 w-7" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-700">
                  Open LMS · Certificate of Completion
                </p>
                <h2 className="mt-5 text-2xl font-bold tracking-tight text-navy-900">
                  {user?.name || 'Student'}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
                  has successfully completed the assessment
                </p>
                <p className="mt-2 text-lg font-bold text-ink">{quiz.title}</p>
                <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
                  <div className="rounded-xl border border-brand-100 bg-white/80 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Score</p>
                    <p className="mt-1 text-lg font-bold text-brand-700">
                      {reviewResult.score} / {reviewResult.totalMarks || quiz.totalMarks}
                    </p>
                  </div>
                  <div className="rounded-xl border border-brand-100 bg-white/80 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Percentage</p>
                    <p className="mt-1 text-lg font-bold text-emerald-700">{scorePercent}%</p>
                  </div>
                </div>
                <p className="mt-6 text-xs text-ink-muted">
                  Completed on {new Date(reviewResult.submittedAt || Date.now()).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="outline" size="sm" onClick={() => setIsCertificateOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" icon={Printer} onClick={handlePrintCertificate}>
                Download / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
