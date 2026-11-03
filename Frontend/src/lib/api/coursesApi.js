import { apiRequest } from '../http';
import { MOCK_COURSE_DETAIL } from '../../mocks/mockData';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const MOCK_COURSES = [
  {
    courseId: 1,
    courseName: 'Cell Biology',
    courseCode: 'BIO214',
    description: 'Comprehensive curriculum and lecture series on cell structures.',
    section: 'Section 02',
    professorId: 2,
    professorName: 'Dr. Priya Sharma',
    enrollmentCount: 48,
  },
  {
    courseId: 2,
    courseName: 'Interaction Design',
    courseCode: 'DES202',
    description: 'Studio course covering UI/UX principles and interactive prototyping.',
    section: 'Section 01',
    professorId: 2,
    professorName: 'Prof. Aditya Verma',
    enrollmentCount: 36,
  },
];

export async function createCourse(data) {
  if (useMocks) {
    return {
      courseId: Date.now(),
      courseName: data.courseName,
      courseCode: 'MOCK' + Math.floor(10 + Math.random() * 90),
      description: data.description || '',
      section: data.section || 'Section 01',
      professorId: 2,
      professorName: 'Dr. Priya Sharma',
      enrollmentCount: 0,
    };
  }
  return apiRequest('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listMyCourses() {
  if (useMocks) {
    return MOCK_COURSES;
  }
  return apiRequest('/courses/my');
}

export async function getCourse(courseId) {
  if (useMocks) {
    return {
      courseId: Number(courseId) || 1,
      courseName: MOCK_COURSE_DETAIL.title,
      courseCode: MOCK_COURSE_DETAIL.code.replace(/\s+/g, ''),
      description: 'Comprehensive curriculum and lecture series.',
      section: MOCK_COURSE_DETAIL.section,
      professorId: 2,
      professorName: MOCK_COURSE_DETAIL.instructor,
      enrollmentCount: 48,
    };
  }
  return apiRequest(`/courses/${courseId}`);
}

export async function updateCourse(courseId, data) {
  if (useMocks) {
    return {
      courseId: Number(courseId),
      courseName: data.courseName,
      courseCode: 'BIO214',
      description: data.description,
      section: data.section,
      professorId: 2,
      professorName: 'Dr. Priya Sharma',
      enrollmentCount: 48,
    };
  }
  return apiRequest(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function joinCourse(data) {
  if (useMocks) {
    return {
      courseId: Date.now(),
      courseName: 'Joined Course',
      courseCode: (data.courseCode || 'JOIN01').toUpperCase(),
      description: 'Course joined via code',
      section: 'Section 01',
      professorId: 2,
      professorName: 'Course Professor',
      enrollmentCount: 1,
    };
  }
  return apiRequest('/courses/join', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listCourseStudents(courseId) {
  if (useMocks) {
    return [
      { userId: 1, name: 'Rahul Sharma', email: 'rahul.sharma@geu.edu' },
      { userId: 3, name: 'Arjun Verma', email: 'arjun.verma@geu.edu' },
      { userId: 4, name: 'Ananya Patel', email: 'ananya.patel@geu.edu' },
    ];
  }
  return apiRequest(`/courses/${courseId}/students`);
}

export async function removeStudent(courseId, studentId) {
  if (useMocks) {
    return null;
  }
  return apiRequest(`/courses/${courseId}/students/${studentId}`, {
    method: 'DELETE',
  });
}

export async function leaveCourse(courseId) {
  if (useMocks) {
    return null;
  }
  return apiRequest(`/courses/${courseId}/enrollment`, {
    method: 'DELETE',
  });
}
