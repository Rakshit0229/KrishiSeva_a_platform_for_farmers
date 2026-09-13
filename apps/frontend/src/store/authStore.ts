import { create } from 'zustand';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: 'farmer' | 'officer' | 'admin';
  email?: string;
  mfa_enabled?: boolean;
  has_password?: boolean;
  profile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const STORAGE_KEY = 'krishiseva-auth';

/**
 * Strips sensitive PII (Aadhaar, bank account numbers, passwords, full biometric/demographic profile)
 * before persisting to localStorage.
 */
export function sanitizeUserForStorage(user: User | null): Partial<User> | null {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    // Masked phone if present for display purposes
    phone: user.phone ? user.phone.replace(/(\d{6})\d{4}/, '$1****') : '',
    mfa_enabled: user.mfa_enabled,
    has_password: user.has_password,
  };
}

function getInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
        isAuthenticated: Boolean(parsed.token),
      };
    }
  } catch (e) {
    // ignore
  }
  return { user: null, token: null, isAuthenticated: false };
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

  login: (user, token) => {
    // Security: Only persist minimal, non-sensitive public metadata to localStorage
    const storageUser = sanitizeUserForStorage(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: storageUser, token }));
    // In-memory state retains active session user object
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.token) {
          fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${parsed.token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }).catch(() => {});
        }
      }
    } catch (e) {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (updated) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updated };
      const storageUser = sanitizeUserForStorage(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: storageUser, token: state.token }));
      return { user: newUser };
    });
  },
}));

