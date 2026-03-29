// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/auth/me')
            .then(r => setUser(r.data.user))
            .catch(() => {
                setUser(null);
                localStorage.removeItem('accessToken');
            })
            .finally(() => setLoading(false));
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
        try {
            await api.post('/api/auth/logout');
        } catch {}
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