import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Attach JWT token to every request if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.defaults.withCredentials = true;
axios.defaults.baseURL = BACKEND;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_user')) ?? null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const setUser = (u) => {
    if (u) {
      // Store token separately for API calls
      if (u.token) localStorage.setItem('cc_token', u.token);
      localStorage.setItem('cc_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
    }
    setUserState(u);
  };

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
    } catch {
      // Keep cached user if we have one — avoids flash on reload
      const cached = localStorage.getItem('cc_user');
      if (!cached) setUserState(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { await axios.post('/api/auth/logout'); } catch {}
    setUser(null);
    window.location.href = '/';
  };

  useEffect(() => { checkAuth(); }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
