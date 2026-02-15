import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

/**
 * Authentication Context
 * Manages user authentication state and provides auth functions
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[Auth] Checking if user is logged in...');
        const response = await api.get('/auth/me');
        console.log('[Auth] Session restored successfully:', response.data.user);
        setUser(response.data.user);
        setError(null);
      } catch (err) {
        // User is not authenticated
        console.log('[Auth] No active session or session expired');
        setUser(null);
        setError(null); // Clear any error for no-session scenario
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Sign up new user
   */
  const signup = async (email, password, username) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        username,
      });
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in user
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Auth] Attempting login for:', email);
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      console.log('[Auth] Login successful, user:', response.data.user);
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      console.error('[Auth] Login failed:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user
   */
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Auth] Logging out user...');
      await api.post('/auth/logout');
      console.log('[Auth] Logout successful');
      setUser(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Logout failed';
      console.error('[Auth] Logout error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error
   */
  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
