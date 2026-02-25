// Restroon - Cafe Context for Managing Current Cafe State
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cafeApi } from '@/services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import type { Cafe, DashboardStats } from '@/types';
import { toast } from 'sonner';

interface CafeContextType {
  cafe: Cafe | null;
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchCafe: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createCafe: (data: any) => Promise<void>;
  updateCafe: (data: Partial<Cafe>) => Promise<void>;
  refreshCafe: () => Promise<void>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { joinCafe, leaveCafe } = useSocket();

  // Join/leave cafe room for real-time updates
  useEffect(() => {
    if (cafe?._id) {
      joinCafe(cafe._id);
      return () => {
        leaveCafe(cafe._id);
      };
    }
  }, [cafe?._id, joinCafe, leaveCafe]);

  const fetchCafe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await cafeApi.getMyCafe();

      if (response.data.success) {
        setCafe(response.data.data);
        // Also fetch stats
        fetchStats();
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number, data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to fetch cafe';
      setError(message);

      // If 404, we definitively know the user doesn't have a cafe
      if (error.response?.status === 404) {
        setCafe(null);
        setStats(null);
      }

      console.error('Fetch cafe error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch cafe when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === 'cafe_owner') {
      fetchCafe();
    } else if (!isAuthenticated) {
      setCafe(null);
      setStats(null);
      setError(null);
    }
  }, [isAuthenticated, user, fetchCafe]);

  const fetchStats = useCallback(async () => {
    if (!cafe?._id) return;

    try {
      const { analyticsApi } = await import('@/services/api');
      const response = await analyticsApi.getDashboardStats(cafe._id);

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, [cafe?._id]);

  const createCafe = useCallback(async (data: any) => {
    try {
      setIsLoading(true);
      const response = await cafeApi.create(data);

      if (response.data.success) {
        setCafe(response.data.data);
        toast.success('Cafe created successfully');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create cafe');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCafe = useCallback(async (data: Partial<Cafe>) => {
    if (!cafe?._id) return;

    try {
      setIsLoading(true);
      const response = await cafeApi.update(cafe._id, data);

      if (response.data.success) {
        setCafe(response.data.data);
        toast.success('Cafe updated successfully');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update cafe');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [cafe?._id]);

  const refreshCafe = useCallback(async () => {
    await fetchCafe();
  }, [fetchCafe]);

  const value: CafeContextType = {
    cafe,
    stats,
    isLoading,
    error,
    fetchCafe,
    fetchStats,
    createCafe,
    updateCafe,
    refreshCafe,
  };

  return (
    <CafeContext.Provider value={value}>
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (context === undefined) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};

export default CafeContext;
