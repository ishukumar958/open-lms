import { apiRequest } from '../http';

const DEFAULT_MOCK_SUBMISSIONS = [
  {
    assignmentId: 1,
    assignment: 'Lab reflection 03',
    student: 'Rahul Sharma',
    submittedIso: '2026-10-18T14:30:00',
    grade: '92%',
    status: 'reviewed',
    feedback: 'Excellent analytical observations.',
  },
];

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export async function submitAssignment(assignmentId, data) {
  if (useMocks) {
    return {
      submissionId: Date.now(),
      assignmentId: Number(assignmentId),
      studentId: 1,
      studentName: 'Rahul Sharma',
      fileUrl: data.fileUrl || '',
      submissionText: data.submissionText || '',
      submittedAt: new Date().toISOString(),
      marks: null,
      status: 'SUBMITTED',
      feedback: null,
    };
  }
  return apiRequest(`/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMySubmission(assignmentId) {
  if (useMocks) {
    return {
      submissionId: 501,
      assignmentId: Number(assignmentId),
      studentId: 1,
      studentName: 'Rahul Sharma',
      fileUrl: 'https://example.com/submission.pdf',
      submissionText: 'Completed lab report notes.',
      submittedAt: '2026-10-18T14:30:00',
      marks: 92,
      status: 'APPROVED',
      feedback: 'Excellent analytical observations.',
    };
  }
  return apiRequest(`/assignments/${assignmentId}/submissions/me`);
}

export async function listAssignmentSubmissions(assignmentId) {
  if (useMocks) {
    return DEFAULT_MOCK_SUBMISSIONS.filter(
      (s) => !assignmentId || String(s.assignmentId) === String(assignmentId)
    ).map((s, i) => ({
      submissionId: i + 1,
      assignmentId: Number(assignmentId) || 1,
      assignmentTitle: s.assignment,
      studentId: i + 1,
      studentName: s.student,
      fileUrl: 'https://example.com/submission.pdf',
      submissionText: '',
      submittedAt: s.submittedIso || '2026-10-18T14:30:00',
      marks: s.grade ? Number(s.grade.replace('%', '')) : null,
      status: s.status === 'reviewed' ? 'APPROVED' : 'SUBMITTED',
      feedback: s.feedback || null,
    }));
  }
  return apiRequest(`/assignments/${assignmentId}/submissions`);
}

export async function listMySubmissions() {
  if (useMocks) {
    return [
      {
        submissionId: 501,
        assignmentId: 1,
        assignmentTitle: 'Lab reflection 03',
        courseId: 1,
        courseName: 'Cell Biology',
        studentId: 1,
        studentName: 'Rahul Sharma',
        fileUrl: 'https://example.com/submission.pdf',
        submissionText: '',
        submittedAt: '2026-10-18T14:30:00',
        marks: 19,
        status: 'APPROVED',
        feedback: 'Great work!',
      },
    ];
  }
  return apiRequest('/submissions/my');
}

export async function listSubmissions(params = {}) {
  if (useMocks) {
    return DEFAULT_MOCK_SUBMISSIONS.map((s, i) => ({
      submissionId: i + 1,
      assignmentId: 1,
      assignmentTitle: s.assignment,
      courseId: 1,
      courseName: 'Cell Biology',
      studentId: i + 1,
      studentName: s.student,
      fileUrl: 'https://example.com/submission.pdf',
      submissionText: '',
      submittedAt: s.submittedIso || '2026-10-18T14:30:00',
      marks: s.grade ? Number(s.grade.replace('%', '')) : null,
      status: s.status === 'reviewed' ? 'APPROVED' : 'SUBMITTED',
      feedback: s.feedback || null,
    }));
  }
  const query = new URLSearchParams();
  if (params.courseId) query.append('courseId', params.courseId);
  if (params.status) query.append('status', params.status);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return apiRequest(`/submissions${qs}`);
}

export async function gradeSubmission(submissionId, data) {
  if (useMocks) {
    return {
      submissionId: Number(submissionId),
      assignmentId: 1,
      studentId: 1,
      studentName: 'Rahul Sharma',
      fileUrl: 'https://example.com/submission.pdf',
      submissionText: '',
      submittedAt: '2026-10-18T14:30:00',
      marks: data.marks,
      status: data.status,
      feedback: data.feedback,
    };
  }
  return apiRequest(`/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
