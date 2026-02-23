// OrderSmartly - Authentication Context (Google OAuth Aligned)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import type { User, UserRole } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  googleLogin: (idToken: string, role?: UserRole) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token is still valid with backend
          const response = await authApi.getMe();
          if (response.data.success) {
            setUser(response.data.data);
            localStorage.setItem('user', JSON.stringify(response.data.data));
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          // Clear invalid tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('currentCafeId');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Traditional Email/Password Login
  const login = useCallback(async (email: string, password: string, role?: UserRole) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password, role);

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);

        // Redirect based on role
        redirectByRole(user.role);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Google OAuth Login
  const googleLogin = useCallback(async (idToken: string, role?: UserRole) => {
    try {
      setIsLoading(true);
      const response = await authApi.googleLogin(idToken, role);

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        toast.success(`Welcome, ${user.name}!`);

        // Redirect based on role
        redirectByRole(user.role);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Google login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Registration
  const register = useCallback(async (data: { name: string; email: string; password: string; phone?: string; role?: UserRole }) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        toast.success('Registration successful!');

        // Redirect based on role
        redirectByRole(user.role);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('currentCafeId');
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    }
  }, [navigate]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  // Role check helper
  const hasRole = useCallback((roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  // Redirect helper based on user role
  const redirectByRole = (role: UserRole) => {
    if (role === 'super_admin') {
      navigate('/admin');
    } else if (role === 'cafe_owner') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    googleLogin,
    register,
    logout,
    refreshUser,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
