import { create } from 'zustand';
import { authStorage } from '../lib/auth';
import { MOCK_USERS } from '../mocks/mockData';
import { apiRequest } from '../lib/http';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export const normalizeRole = (role) => {
  if (!role) return null;
  const upper = String(role).toUpperCase();
  if (upper === 'PROFESSOR' || upper === 'FACULTY' || upper === 'TEACHER') {
    return 'FACULTY';
  }
  return 'STUDENT';
};

const savedUser = authStorage.getUser() || (useMocks ? MOCK_USERS.student : null);
const initialToken = authStorage.getToken() || savedUser?.token;
const initialRole = normalizeRole(savedUser?.role);
const initialAuth = Boolean(savedUser && (useMocks || initialToken));

export const useAuthStore = create((set, get) => ({
  user: savedUser ? { ...savedUser, role: initialRole || savedUser.role } : null,
  isAuthenticated: initialAuth,
  role: initialRole,

  initAuth: async () => {
    if (useMocks) return;
    const token = authStorage.getToken() || savedUser?.token;
    if (!token) {
      set({ user: null, isAuthenticated: false, role: null });
      return;
    }

    // If using mock token, keep active session without calling backend
    if (typeof token === 'string' && token.startsWith('mock-')) {
      const current = authStorage.getUser() || savedUser;
      if (current) {
        const normRole = normalizeRole(current.role);
        set({ user: { ...current, role: normRole }, isAuthenticated: true, role: normRole });
      }
      return;
    }

    try {
      const me = await apiRequest('/auth/me');
      const currentUser = authStorage.getUser() || savedUser || {};
      const normRole = normalizeRole(me?.role || currentUser.role);
      const updatedUser = { ...currentUser, ...me, role: normRole, token };
      authStorage.setUser(updatedUser);
      set({ user: updatedUser, isAuthenticated: true, role: normRole });
    } catch (err) {
      // ONLY log out if backend returns 401 Unauthorized (invalid/expired session)
      if (err?.status === 401) {
        get().logout();
      } else {
        // Network error, mixed content, or server offline: preserve cached session!
        const currentUser = authStorage.getUser() || savedUser;
        if (currentUser) {
          const normRole = normalizeRole(currentUser.role);
          set({ user: { ...currentUser, role: normRole }, isAuthenticated: true, role: normRole });
        }
      }
    }
  },

  login: async (email, password, role = 'STUDENT', remember = true) => {
    const roleNormalized = normalizeRole(role);
    if (!useMocks) {
      const user = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const normRole = normalizeRole(user.role || roleNormalized);
      const userToStore = { ...user, role: normRole };
      authStorage.setToken(user.token, remember);
      authStorage.setUser(userToStore, remember);
      set({ user: userToStore, isAuthenticated: true, role: normRole });
      return userToStore;
    }
    const userToSet = roleNormalized === 'FACULTY' ? MOCK_USERS.professor : MOCK_USERS.student;
    const mockToken = 'mock-jwt-token-' + Date.now();
    const mockUserToStore = { ...userToSet, token: mockToken, role: roleNormalized };
    authStorage.setToken(mockToken, remember);
    authStorage.setUser(mockUserToStore, remember);
    set({ user: mockUserToStore, isAuthenticated: true, role: roleNormalized });
    return mockUserToStore;
  },

  loginWithClerk: async ({ token, user }, remember = true) => {
    const pendingRole = typeof window !== 'undefined'
      ? window.sessionStorage.getItem('openlms_pending_role')
      : null;
    const rawRole = pendingRole || user.publicMetadata?.role || user.unsafeMetadata?.role || 'STUDENT';
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('openlms_pending_role');
    }
    const normalizedRole = normalizeRole(rawRole);
    const currentUser = {
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Open LMS User',
      email: user.primaryEmailAddress?.emailAddress || '',
      role: normalizedRole,
      clerkUserId: user.id,
      token,
    };

    authStorage.setToken(token, remember);
    authStorage.setUser(currentUser, remember);
    set({ user: currentUser, isAuthenticated: true, role: normalizedRole });
    return currentUser;
  },

  register: async ({ name, email, password, roleName = 'STUDENT' }, remember = true) => {
    const normRole = normalizeRole(roleName);
    if (useMocks) {
      return get().login(email, password, normRole, remember);
    }
    const user = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, roleName: normRole }),
    });
    const finalRole = normalizeRole(user.role || normRole);
    const userToStore = { ...user, role: finalRole };
    authStorage.setToken(user.token, remember);
    authStorage.setUser(userToStore, remember);
    set({ user: userToStore, isAuthenticated: true, role: finalRole });
    return userToStore;
  },

  googleLogin: async ({ credential, accessToken, roleName = null }, remember = true) => {
    const normRole = normalizeRole(roleName);
    if (!useMocks) {
      const user = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential, accessToken, roleName: normRole }),
      });
      const finalRole = normalizeRole(user.role || normRole);
      const userToStore = { ...user, role: finalRole };
      authStorage.setToken(user.token, remember);
      authStorage.setUser(userToStore, remember);
      set({ user: userToStore, isAuthenticated: true, role: finalRole });
      return userToStore;
    }
    const userToSet = normRole === 'FACULTY' ? MOCK_USERS.professor : MOCK_USERS.student;
    const mockToken = 'mock-jwt-token-' + Date.now();
    const mockUserToStore = { ...userToSet, token: mockToken, role: normRole };
    authStorage.setToken(mockToken, remember);
    authStorage.setUser(mockUserToStore, remember);
    set({ user: mockUserToStore, isAuthenticated: true, role: normRole });
    return mockUserToStore;
  },

  switchRole: async (newRole) => {
    const normRole = normalizeRole(newRole);
    if (!useMocks) {
      const email = normRole === 'FACULTY'
        ? 'priya.sharma@geu.edu'
        : 'rahul.sharma@geu.edu';
      return await get().login(email, 'password123', normRole);
    }
    const newUser = normRole === 'FACULTY' ? MOCK_USERS.professor : MOCK_USERS.student;
    const token = authStorage.getToken() || 'mock-jwt-token-' + Date.now();
    const mockUserToStore = { ...newUser, token, role: normRole };
    authStorage.setUser(mockUserToStore);
    set({ user: mockUserToStore, role: normRole });
  },

  logout: () => {
    authStorage.clear();
    set({ user: null, isAuthenticated: false, role: null });
  },
}));
