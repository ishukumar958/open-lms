import { apiRequest } from '../http';
import { MOCK_STUDENT_DASHBOARD, MOCK_PROFESSOR_DASHBOARD } from '../../mocks/mockData';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export async function getStudentDashboard() {
  if (useMocks) {
    return MOCK_STUDENT_DASHBOARD;
  }
  return apiRequest('/dashboard/student');
}

export async function getProfessorDashboard() {
  if (useMocks) {
    return MOCK_PROFESSOR_DASHBOARD;
  }
  return apiRequest('/dashboard/professor');
}
