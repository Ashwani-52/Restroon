// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched            = useRef(false);   // prevent double fetch

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Check URL for token first (from Google OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
        localStorage.setItem('accessToken', urlToken);
        // Clean up URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('accessToken');

    // ─── If no token at all — don't even call API ─
    if (!token) {
      setLoading(false);
      return;
    }

    // ─── Try to get current user ────────────────
    api.get('/api/auth/me')
      .then(r => {
        setUser(r.data.user);
      })
      .catch(async () => {
        // ─── Try refresh token ─────────────────
        try {
          const refreshRes = await api.post('/api/auth/refresh');
          if (refreshRes.data.accessToken) {
            localStorage.setItem('accessToken', refreshRes.data.accessToken);
          }
          // ─── Retry /me after refresh ──────────
          const meRes = await api.get('/api/auth/me');
          setUser(meRes.data.user);
        } catch {
          // ─── Truly expired — clear everything ─
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/api/auth/login', { email, password });
    if (r.data.accessToken) {
      localStorage.setItem('accessToken', r.data.accessToken);
    }
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (data) => {
    const r = await api.post('/api/auth/register', data);
    if (r.data.accessToken) {
      localStorage.setItem('accessToken', r.data.accessToken);
    }
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);