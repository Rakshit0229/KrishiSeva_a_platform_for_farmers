import axios, { InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { validateRedirectUrl } from '../utils/sanitize';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Secure Cookies: ensures HttpOnly & SameSite cookies are transmitted
  headers: {
    'Content-Type': 'application/json',
  },
});

let csrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;

/**
 * Retrieves the active Anti-CSRF token, either from memory or by requesting
 * the server's CSRF endpoint.
 */
export async function getCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  if (csrfPromise) return csrfPromise;

  csrfPromise = (async () => {
    try {
      const response = await axios.get('/api/v1/csrf-token', { withCredentials: true });
      if (response.data && response.data.csrfToken) {
        csrfToken = response.data.csrfToken;
        return csrfToken;
      }
    } catch {
      // Fallback if running with non-prefixed endpoint
      try {
        const fallback = await axios.get('/api/csrf-token', { withCredentials: true });
        if (fallback.data && fallback.data.csrfToken) {
          csrfToken = fallback.data.csrfToken;
          return csrfToken;
        }
      } catch {
        // Ignore CSRF fetch errors gracefully
      }
    } finally {
      csrfPromise = null;
    }
    return null;
  })();

  return csrfPromise;
}

export function setCsrfToken(token: string) {
  csrfToken = token;
}

// Request Interceptor: Attach JWT Token and Anti-CSRF Token
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 6. CSRF Protection: Attach anti-CSRF token on mutating requests
  const method = (config.method || 'GET').toUpperCase();
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (mutatingMethods.includes(method)) {
    const activeToken = await getCsrfToken();
    if (activeToken) {
      config.headers['X-CSRF-Token'] = activeToken;
    }
  }

  return config;
});

// Response Interceptor: 401 Logout, 403 CSRF Refresh, & Global Error Handling
apiClient.interceptors.response.use(
  (response) => {
    // If backend returns a new CSRF token in header, cache it
    const newCsrf = response.headers['x-csrf-token'];
    if (newCsrf && typeof newCsrf === 'string') {
      csrfToken = newCsrf;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle CSRF Token Expiration (Retry once with fresh token)
    if (
      error.response?.status === 403 &&
      error.response?.data?.error?.includes('CSRF') &&
      !originalRequest._retryCsrf
    ) {
      originalRequest._retryCsrf = true;
      csrfToken = null;
      const freshToken = await getCsrfToken();
      if (freshToken) {
        originalRequest.headers['X-CSRF-Token'] = freshToken;
        return apiClient(originalRequest);
      }
    }

    // 8. Validate Redirects: Handle session expiration with safe redirect destination
    if (error.response?.status === 401) {
      const { logout, isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        logout();
        toast.error('Session expired. Please log in again.');
        const safeDestination = validateRedirectUrl('/login', '/');
        window.location.href = safeDestination;
      }
    }
    return Promise.reject(error);
  }
);

