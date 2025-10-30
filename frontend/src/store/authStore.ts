import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => {
    localStorage.setItem('auth-token', token);
    localStorage.setItem('auth-user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },
  logout: () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
  setUser: (user) => set({ user }),
}));

// Initialize from localStorage on app start
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('auth-token');
  const userStr = localStorage.getItem('auth-user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      useAuthStore.setState({
        user,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      // Clear invalid data
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
    }
  }
}
