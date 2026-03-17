import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

// ✅ FIX: Use full backend URL — relative URLs only work when
// frontend and backend are on the same port (production).
// In dev, frontend is :5173 and backend is :4000 — relative /api calls fail silently.
const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${BACKEND}/api/auth/me`);
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${BACKEND}/api/auth/logout`);
    } catch (err) {
      console.error('Logout error:', err);
    }
    // ✅ Always clear user and redirect even if the request fails
    setUser(null);
    window.location.href = '/';
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);