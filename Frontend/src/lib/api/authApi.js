import { apiRequest } from '../http';
import { MOCK_USERS } from '../../mocks/mockData';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export async function register(data) {
  if (useMocks) {
    const role = (data.roleName || 'STUDENT').toUpperCase();
    const mock = role === 'FACULTY' || role === 'PROFESSOR' ? MOCK_USERS.professor : MOCK_USERS.student;
    return {
      userId: 1,
      name: data.name || mock.name,
      email: data.email || mock.email,
      role: role === 'PROFESSOR' ? 'FACULTY' : role,
      roleId: role === 'FACULTY' || role === 'PROFESSOR' ? 2 : 1,
      token: 'mock-jwt-token-' + Date.now(),
      isActive: true,
    };
  }
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(credentials) {
  if (useMocks) {
    const isProf = credentials.email?.toLowerCase().includes('prof') || credentials.email?.toLowerCase().includes('priya');
    const mock = isProf ? MOCK_USERS.professor : MOCK_USERS.student;
    return {
      userId: isProf ? 2 : 1,
      name: mock.name,
      email: credentials.email || mock.email,
      role: isProf ? 'FACULTY' : 'STUDENT',
      roleId: isProf ? 2 : 1,
      token: 'mock-jwt-token-' + Date.now(),
      isActive: true,
    };
  }
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function getMe() {
  if (useMocks) {
    const mock = MOCK_USERS.student;
    return {
      userId: 1,
      name: mock.name,
      email: mock.email,
      role: 'STUDENT',
      roleId: 1,
      isActive: true,
    };
  }
  return apiRequest('/auth/me');
}

export async function googleLogin(payload) {
  if (useMocks) {
    const role = (payload.roleName || 'STUDENT').toUpperCase();
    const mock = role === 'FACULTY' || role === 'PROFESSOR' ? MOCK_USERS.professor : MOCK_USERS.student;
    return {
      userId: 1,
      name: mock.name,
      email: mock.email,
      role: role === 'PROFESSOR' ? 'FACULTY' : role,
      roleId: role === 'FACULTY' || role === 'PROFESSOR' ? 2 : 1,
      token: 'mock-jwt-token-' + Date.now(),
      isActive: true,
    };
  }
  return apiRequest('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

