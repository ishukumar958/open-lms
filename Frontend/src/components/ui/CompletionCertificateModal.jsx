import React from 'react';
import { CheckCircle2, Printer, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function printCompletionCertificate({
  studentName,
  courseName,
  courseCode,
  quizTitle,
  score,
  totalMarks,
  submittedAt,
}) {
  const scorePercent = Math.round(((score || 0) / (totalMarks || 1)) * 100);
  if (scorePercent < 50) {
    alert('Certificate is only available for scores of 50% or higher.');
    return;
  }
  const completionDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Date unavailable';
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    throw new Error('Please allow pop-ups to download the certificate.');
  }

  const logoUrl = `${window.location.origin}/logo.svg`;

  printWindow.document.write(`<!doctype html>
    <html>
      <head>
        <title>Open LMS Certificate - ${escapeHtml(studentName || 'Student')}</title>
        <style>
          @page { size: A4 landscape; margin: 0; }
          * { box-sizing: border-box; }
          html, body { width: 100%; height: 100%; margin: 0; }
          body { background: #eef0ff; font-family: Arial, Helvetica, sans-serif; color: #171a3b; }
          .page {
            width: 297mm;
            height: 210mm;
            padding: 10mm;
            margin: 0 auto;
            background: linear-gradient(135deg, #ffffff 0%, #f4f3ff 52%, #eef0ff 100%);
          }
          .certificate {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border: 3px solid #5b4fe5;
            outline: 1px solid #b9b4ff;
            outline-offset: -9px;
            text-align: center;
            padding: 18mm 20mm;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate:before, .certificate:after {
            content: '';
            position: absolute;
            width: 55mm;
            height: 55mm;
            border-radius: 50%;
            background: #e7e8ff;
            opacity: .7;
          }
          .certificate:before { top: -25mm; right: -15mm; }
          .certificate:after { bottom: -28mm; left: -18mm; background: #e9f8ef; }
          .content { position: relative; z-index: 1; width: 100%; }
          .logo { width: 18mm; height: 18mm; margin: 0 auto 3mm; display: block; }
          .brand { color: #4c3ed4; font-size: 11pt; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; }
          h1 { margin: 4mm 0 3mm; color: #10122f; font-size: 29pt; letter-spacing: 2px; text-transform: uppercase; }
          .label { color: #6b7090; font-size: 12pt; margin: 0; }
          .student { margin: 2mm 0; color: #4c3ed4; font-size: 26pt; font-weight: 700; }
          .statement { margin: 2mm auto 1mm; color: #6b7090; font-size: 12pt; }
          .course { margin: 0; font-size: 17pt; font-weight: 700; }
          .quiz { margin: 2mm 0 7mm; color: #6b7090; font-size: 10pt; }
          .stats { display: flex; justify-content: center; gap: 8mm; }
          .stat { min-width: 42mm; padding: 3mm 7mm; border: 1px solid #d8d6ff; border-radius: 4mm; background: rgba(255,255,255,.82); }
          .stat-label { color: #6b7090; font-size: 8pt; text-transform: uppercase; letter-spacing: 1px; }
          .stat-value { margin-top: 1mm; color: #4c3ed4; font-size: 17pt; font-weight: 700; }
          .footer { display: flex; justify-content: center; gap: 14mm; margin-top: 8mm; color: #6b7090; font-size: 9pt; }
          .verified { color: #16803c; font-weight: 700; }
          .signature { margin-top: 7mm; color: #4c3ed4; font-size: 10pt; font-weight: 700; }
          @media print {
            body { background: white; }
            .page { margin: 0; }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="certificate">
            <div class="content">
              <img class="logo" src="${escapeHtml(logoUrl)}" alt="Open LMS logo" />
              <div class="brand">Open LMS</div>
              <h1>Certificate of Completion</h1>
              <p class="label">This is to certify that</p>
              <div class="student">${escapeHtml(studentName || 'Student')}</div>
              <p class="statement">has successfully completed the course assessment for</p>
              <p class="course">${escapeHtml(courseName || 'Open LMS Course')}</p>
              <p class="quiz">${escapeHtml(courseCode ? `${courseCode} · ` : '')}${escapeHtml(quizTitle)}</p>
              <div class="stats">
                <div class="stat"><div class="stat-label">Score</div><div class="stat-value">${escapeHtml(score)} / ${escapeHtml(totalMarks)}</div></div>
                <div class="stat"><div class="stat-label">Percentage</div><div class="stat-value">${scorePercent}%</div></div>
              </div>
              <div class="footer">
                <span>Completed on ${escapeHtml(completionDate)}</span>
                <span class="verified">Open LMS Verified Signature</span>
              </div>
              <div class="signature">Digitally verified learning achievement</div>
            </div>
          </section>
        </main>
      </body>
    </html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.addEventListener('load', () => {
    printWindow.print();
    printWindow.addEventListener('afterprint', () => printWindow.close(), { once: true });
  }, { once: true });
}

export function CompletionCertificateModal({
  isOpen,
  onClose,
  studentName,
  courseName,
  courseCode,
  quiz,
  submittedAt,
}) {
  if (!quiz) return null;

  const scorePercent = Math.round(((quiz.score || 0) / (quiz.totalMarks || 1)) * 100);
  if (scorePercent < 50) return null;
  const completionDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Date unavailable';

  const handlePrint = () => printCompletionCertificate({
    studentName,
    courseName,
    courseCode,
    quizTitle: quiz.title,
    score: quiz.score,
    totalMarks: quiz.totalMarks,
    submittedAt,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Certificate of completion"
      description="Download a full-size certificate or save it as a PDF."
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        <div
          id="completion-certificate"
          className="relative mx-auto flex aspect-[1.414/1] min-h-[420px] w-full max-w-[1120px] items-center justify-center overflow-hidden rounded-xl border-[10px] border-double border-brand-300 bg-gradient-to-br from-white via-brand-50/40 to-violet-50 p-6 text-center shadow-inner sm:p-10"
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-100/60" />
          <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-violet-100/60" />
          <div className="relative flex h-full w-full flex-col items-center justify-center">
          <img
            src="/logo.svg"
            alt="Open LMS logo"
            className="mb-2 h-14 w-14 rounded-xl shadow-lg sm:h-16 sm:w-16"
          />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-700 sm:text-xs">
              Open LMS
            </p>
            <h1 className="mt-2 text-xl font-black uppercase tracking-[0.12em] text-navy-900 sm:text-3xl">
              Certificate of Completion
            </h1>
            <p className="mt-3 text-xs text-ink-muted sm:text-sm">
              This is to certify that
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-brand-700 sm:text-4xl">
              {studentName || 'Student'}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-ink-muted sm:text-sm">
              has successfully completed the course assessment for
            </p>
            <p className="mt-1 text-base font-bold text-ink sm:text-xl">
              {courseName || 'Open LMS Course'}
            </p>
            <p className="mt-1 text-[10px] font-medium text-ink-muted sm:text-xs">
              {courseCode ? `${courseCode} · ` : ''}{quiz.title}
            </p>
            <div className="mx-auto mt-4 grid w-full max-w-md grid-cols-2 gap-3 sm:mt-6">
              <div className="rounded-xl border border-brand-100 bg-white/80 p-2 sm:p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-muted sm:text-[10px]">Score</p>
                <p className="mt-1 text-base font-bold text-brand-700 sm:text-lg">
                  {quiz.score} / {quiz.totalMarks}
                </p>
              </div>
              <div className="rounded-xl border border-brand-100 bg-white/80 p-2 sm:p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-muted sm:text-[10px]">Percentage</p>
                <p className="mt-1 text-base font-bold text-emerald-700 sm:text-lg">{scorePercent}%</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-6 text-[10px] text-ink-muted sm:mt-6 sm:text-xs">
              <span>Completed on {completionDate}</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Open LMS Verified
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-ink-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
              <span>Digitally verified learning achievement</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Download / Save PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}
