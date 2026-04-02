// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL        : import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout        : 15000    // 15 second timeout — prevents hanging
});

// ─── Always attach token from localStorage ───
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Handle 401 — try refresh once ──────────
let isRefreshing  = false;
let failedQueue   = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers['Authorization'] = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers        : {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );

        const newToken = res.data.accessToken;
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        }

        processQueue(null, newToken);
        return api(original);

      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        // ─── Only redirect if on protected page ──
        const publicPaths = ['/cafes', '/login', '/register', '/cafe'];
        const isPublic    = window.location.pathname === '/' || publicPaths.some(p => window.location.pathname.startsWith(p));
        if (!isPublic) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 503) {
      window.location.href = '/maintenance';
    }

    return Promise.reject(error);
  }
);

// --- New API Endpoints for AdSense Pages ---
export const submitContact = (data) => api.post('/api/contact', data);
export const getBlogs = () => api.get('/api/blogs');
export const getBlogBySlug = (slug) => api.get(`/api/blogs/${slug}`);

export default api;