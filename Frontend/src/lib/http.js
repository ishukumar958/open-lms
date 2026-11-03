import { authStorage } from './auth';
import { useAuthStore } from '../store/authStore';

// Standard normalized API response helper
export async function apiRequest(endpoint, options = {}) {
  const token = authStorage.getToken();
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';

  if (!useMocks) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          error: errorData.error || 'ERROR',
          message: errorData.message || 'API request failed',
          fieldErrors: errorData.fieldErrors || errorData.errors || [],
        };
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (err) {
      if (err?.status) {
        throw err;
      }
      throw {
        status: 0,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to the backend. Make sure the Spring Boot server is running.',
        fieldErrors: [],
      };
    }
  }

  // Mock response fallback handled in feature api layers
  return null;
}
