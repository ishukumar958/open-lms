import { apiRequest } from '../http';

const DEFAULT_MOCK_GRADEBOOK = {
  columns: [
    { key: 'a1', name: 'Lab reflection 02', type: 'ASSIGNMENT', total: 20 },
    { key: 'q1', name: 'Quiz 1: Organelles', type: 'QUIZ', total: 20 },
  ],
  students: [
    { name: 'Rahul Sharma', overallGrade: 92, letterGrade: 'A', scores: { a1: 18.5, q1: 19 } },
  ],
};

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export async function getCourseGradebook(courseId) {
  if (useMocks) {
    return {
      courseId: Number(courseId),
      courseName: 'Cell Biology',
      students: DEFAULT_MOCK_GRADEBOOK.students.map((s, i) => ({
        studentId: i + 1,
        studentName: s.name,
        email: `${s.name.toLowerCase().replace(/\s+/g, '.')}@geu.edu`,
        overallGrade: s.overallGrade,
        letterGrade: s.letterGrade,
        scores: s.scores,
      })),
      assignments: DEFAULT_MOCK_GRADEBOOK.columns.map((c) => ({
        id: c.key,
        title: c.name,
        type: c.type,
        maxPoints: c.total,
      })),
    };
  }
  return apiRequest(`/courses/${courseId}/gradebook`);
}

export async function getMyCourseGrades(courseId) {
  if (useMocks) {
    return {
      courseId: Number(courseId),
      courseName: 'Cell Biology',
      overallGrade: 92,
      letterGrade: 'A',
      items: [
        {
          id: 'q1',
          title: 'Quiz 1: Organelles',
          type: 'QUIZ',
          score: 19,
          maxPoints: 20,
          dueIso: '2026-09-15T23:59:00',
          weight: '10%',
        },
        {
          id: 'a1',
          title: 'Lab reflection 02',
          type: 'ASSIGNMENT',
          score: 18.5,
          maxPoints: 20,
          dueIso: '2026-09-22T23:59:00',
          weight: '15%',
        },
      ],
    };
  }
  return apiRequest(`/courses/${courseId}/grades/me`);
}
