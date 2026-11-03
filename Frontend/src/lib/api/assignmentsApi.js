import { apiRequest } from '../http';

const DEFAULT_MOCK_ASSIGNMENTS = [
  {
    title: 'Lab reflection 03: Membrane transport',
    summary: 'Analyze diffusion rates across dialysis tubing.',
    course: 'Cell Biology',
    dueIso: '2026-11-05T23:59:00',
    points: 20,
    status: 'pending',
  },
  {
    title: 'Design critique: Figma mobile mockup',
    summary: 'Submit mobile wireframes and micro-interaction flows.',
    course: 'Interaction Design',
    dueIso: '2026-11-06T14:00:00',
    points: 15,
    status: 'pending',
  },
];

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export async function createAssignment(courseId, data) {
  if (useMocks) {
    return {
      assignmentId: Date.now(),
      courseId: Number(courseId),
      title: data.title,
      description: data.description || '',
      dueDate: data.dueDate,
      maxPoints: data.maxPoints,
    };
  }
  return apiRequest(`/courses/${courseId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listCourseAssignments(courseId) {
  if (useMocks) {
    return DEFAULT_MOCK_ASSIGNMENTS.map((a, i) => ({
      assignmentId: i + 1,
      courseId: Number(courseId),
      title: a.title,
      description: a.summary || '',
      dueDate: a.dueIso || '2026-11-05T23:59:00',
      maxPoints: a.points || 100,
      studentStatus: a.status?.toUpperCase() || 'PENDING',
    }));
  }
  return apiRequest(`/courses/${courseId}/assignments`);
}

export async function listMyAssignments() {
  if (useMocks) {
    return DEFAULT_MOCK_ASSIGNMENTS.map((a, i) => ({
      assignmentId: i + 1,
      courseId: 1,
      courseName: a.course,
      title: a.title,
      description: a.summary || '',
      dueDate: a.dueIso || '2026-11-05T23:59:00',
      maxPoints: a.points || 100,
      studentStatus: a.status?.toUpperCase() || 'PENDING',
    }));
  }
  return apiRequest('/assignments/my');
}

export async function getAssignment(assignmentId) {
  if (useMocks) {
    const a = DEFAULT_MOCK_ASSIGNMENTS[0] || {};
    return {
      assignmentId: Number(assignmentId),
      courseId: 1,
      courseName: a.course || 'Cell Biology',
      title: a.title || 'Lab Report 1',
      description: a.summary || 'Detailed submission instructions.',
      dueDate: a.dueIso || '2026-11-05T23:59:00',
      maxPoints: a.points || 100,
      studentStatus: a.status?.toUpperCase() || 'PENDING',
    };
  }
  return apiRequest(`/assignments/${assignmentId}`);
}

export async function updateAssignment(assignmentId, data) {
  if (useMocks) {
    return {
      assignmentId: Number(assignmentId),
      courseId: 1,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      maxPoints: data.maxPoints,
    };
  }
  return apiRequest(`/assignments/${assignmentId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAssignment(assignmentId) {
  if (useMocks) {
    return null;
  }
  return apiRequest(`/assignments/${assignmentId}`, {
    method: 'DELETE',
  });
}
