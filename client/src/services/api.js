// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

// ─── Auto-attach token from localStorage ────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// ─── Auto refresh on 401 ────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                // ─── Save new token ──────────────────
                if (res.data.accessToken) {
                    localStorage.setItem('accessToken', res.data.accessToken);
                }
                return api(original);
            } catch {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;