import { useState, useEffect, useCallback } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: ''
  });
  const [token, setToken] = useState('');

  // Check if already authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // Try to fetch an admin-protected resource to verify auth
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });

      if (response.ok) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          error: ''
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: ''
        });
      }
    } catch {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: ''
      });
    }
  }, []);

  const authenticate = useCallback(async (password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: password })
      });

      if (response.ok) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          error: ''
        });
        setToken('');
        return true;
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: 'Invalid token'
        });
        return false;
      }
    } catch {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication failed'
      });
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // Ignore logout errors
    }

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: ''
    });
    setToken('');
  }, []);

  return {
    ...authState,
    token,
    setToken,
    authenticate,
    logout,
    checkAuth
  };
}
