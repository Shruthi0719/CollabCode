import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = BACKEND;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ── Seed state from localStorage so page reload doesn't flash logged-out ──
  const [user,    setUserState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cc_user')) ?? null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Wrap setUser so it always syncs to localStorage
  const setUser = (u) => {
    if (u) localStorage.setItem('cc_user', JSON.stringify(u));
    else    localStorage.removeItem('cc_user');
    setUserState(u);
  };

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
    } catch {
      // If /me fails but we have localStorage user, keep them logged in
      // Only clear if we get a definitive 401
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
