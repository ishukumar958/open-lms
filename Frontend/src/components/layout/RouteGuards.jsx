import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RequireRole({ allowedRole, children }) {
  const role = useAuthStore((s) => s.role);
  const normalizedRole = role === 'PROFESSOR' ? 'FACULTY' : role;
  const targetRole = allowedRole === 'PROFESSOR' ? 'FACULTY' : allowedRole;

  if (normalizedRole !== targetRole) {
    if (normalizedRole === 'FACULTY') {
      return <Navigate to="/professor/overview" replace />;
    }
    return <Navigate to="/student/home" replace />;
  }

  return children;
}
