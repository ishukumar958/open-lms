import { create } from 'zustand';
import { authStorage } from '../lib/auth';
import { MOCK_USERS } from '../mocks/mockData';
import { apiRequest } from '../lib/http';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
const savedUser = authStorage.getUser() || (useMocks ? MOCK_USERS.student : null);

export const useAuthStore = create((set, get) => ({
  user: savedUser,
  isAuthenticated: useMocks ? Boolean(savedUser) : Boolean(savedUser && authStorage.getToken()),
  role: savedUser?.role || null,

  initAuth: async () => {
    if (useMocks) return;
    const token = authStorage.getToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, role: null });
      return;
    }
    try {
      const me = await apiRequest('/auth/me');
      const currentUser = authStorage.getUser() || {};
      const updatedUser = { ...currentUser, ...me, token };
      authStorage.setUser(updatedUser);
      set({ user: updatedUser, isAuthenticated: true, role: me.role });
    } catch (err) {
      get().logout();
    }
  },

  login: async (email, password, role = 'STUDENT', remember = true) => {
    if (!useMocks) {
      const user = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      authStorage.setToken(user.token, remember);
      authStorage.setUser(user, remember);
      set({ user, isAuthenticated: true, role: user.role });
      return user;
    }
    const userToSet = (role === 'PROFESSOR' || role === 'FACULTY') ? MOCK_USERS.professor : MOCK_USERS.student;
    authStorage.setToken('mock-jwt-token-' + Date.now(), remember);
    authStorage.setUser(userToSet, remember);
    set({ user: userToSet, isAuthenticated: true, role: userToSet.role });
    return userToSet;
  },

  loginWithClerk: async ({ token, user }, remember = true) => {
    const pendingRole = typeof window !== 'undefined'
      ? window.sessionStorage.getItem('openlms_pending_role')
      : null;
    const role = pendingRole || user.publicMetadata?.role || user.unsafeMetadata?.role || 'STUDENT';
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('openlms_pending_role');
    }
    const normalizedRole = role === 'PROFESSOR' ? 'FACULTY' : role;
    const currentUser = {
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Open LMS User',
      email: user.primaryEmailAddress?.emailAddress || '',
      role: normalizedRole,
      clerkUserId: user.id,
    };

    authStorage.setToken(token, remember);
    authStorage.setUser(currentUser, remember);
    set({ user: currentUser, isAuthenticated: true, role: normalizedRole });
    return currentUser;
  },

  register: async ({ name, email, password, roleName = 'STUDENT' }, remember = true) => {
    if (useMocks) {
      return get().login(email, password, (roleName === 'FACULTY' || roleName === 'PROFESSOR') ? 'PROFESSOR' : 'STUDENT', remember);
    }
    const user = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, roleName }),
    });
    authStorage.setToken(user.token, remember);
    authStorage.setUser(user, remember);
    set({ user, isAuthenticated: true, role: user.role });
    return user;
  },

  googleLogin: async ({ credential, accessToken, roleName = null }, remember = true) => {
    if (!useMocks) {
      const user = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential, accessToken, roleName }),
      });
      authStorage.setToken(user.token, remember);
      authStorage.setUser(user, remember);
      set({ user, isAuthenticated: true, role: user.role });
      return user;
    }
    const userToSet = (roleName === 'PROFESSOR' || roleName === 'FACULTY') ? MOCK_USERS.professor : MOCK_USERS.student;
    authStorage.setToken('mock-jwt-token-' + Date.now(), remember);
    authStorage.setUser(userToSet, remember);
    set({ user: userToSet, isAuthenticated: true, role: userToSet.role });
    return userToSet;
  },

  switchRole: async (newRole) => {
    if (!useMocks) {
      const email = (newRole === 'PROFESSOR' || newRole === 'FACULTY')
        ? 'priya.sharma@geu.edu'
        : 'rahul.sharma@geu.edu';
      return await get().login(email, 'password123', newRole);
    }
    const newUser = (newRole === 'PROFESSOR' || newRole === 'FACULTY') ? MOCK_USERS.professor : MOCK_USERS.student;
    authStorage.setUser(newUser);
    set({ user: newUser, role: newRole });
  },

  logout: () => {
    authStorage.clear();
    set({ user: null, isAuthenticated: false, role: null });
  },
}));
