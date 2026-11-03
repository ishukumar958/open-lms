import React from 'react';
import { Navigate } from 'react-router-dom';

export function SsoCallbackPage() {
  return <Navigate to="/login" replace />;
}
