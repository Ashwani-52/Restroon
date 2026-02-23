import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '@/services/api';
import { useSocketEvent } from '@/context/SocketContext';
import type { DashboardStats, SalesData, TopProduct, PlatformStats } from '@/types';

interface UseAnalyticsOptions {
  cafeId?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const { cafeId, period = 'week', autoRefresh = true, refreshInterval = 60000 } = options;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!cafeId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await analyticsApi.getDashboardStats(cafeId);

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to fetch stats';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [cafeId]);

  const fetchSalesData = useCallback(async () => {
    if (!cafeId) return;

    try {
      const response = await analyticsApi.getSalesData(cafeId, period);
      if (response.data.success) {
        setSalesData(response.data.data);
      }
    } catch (err) {
      console.error('Fetch sales data error:', err);
    }
  }, [cafeId, period]);

  const fetchTopProducts = useCallback(async (limit = 5) => {
    if (!cafeId) return;

    try {
      const response = await analyticsApi.getTopProducts(cafeId, limit);
      if (response.data.success) {
        setTopProducts(response.data.data);
      }
    } catch (err) {
      console.error('Fetch top products error:', err);
    }
  }, [cafeId]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
    fetchSalesData();
    fetchTopProducts();
  }, [fetchStats, fetchSalesData, fetchTopProducts]);

  // Real-time synchronization via WebSockets
  useSocketEvent('new-order', (order) => {
    if (order && order.cafe === cafeId) {
      fetchStats();
      fetchSalesData();
      fetchTopProducts();
    }
  }, [cafeId, fetchStats, fetchSalesData, fetchTopProducts]);

  useSocketEvent('order-update', (order) => {
    if (order && order.cafe === cafeId) {
      fetchStats();
      fetchSalesData();
      fetchTopProducts();
    }
  }, [cafeId, fetchStats, fetchSalesData, fetchTopProducts]);

  useSocketEvent('payment-success', (data) => {
    fetchStats();
    fetchSalesData();
    fetchTopProducts();
  }, [fetchStats, fetchSalesData, fetchTopProducts]);

  // Fallback Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStats]);

  return {
    stats,
    salesData,
    topProducts,
    isLoading,
    error,
    fetchStats,
    fetchSalesData,
    fetchTopProducts,
  };
};

// Platform-wide analytics for Super Admin
export const usePlatformAnalytics = () => {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [cafePerformance, setCafePerformance] = useState<{ cafe: unknown; orders: number; revenue: number }[]>([]);
  const [subscriptionStats, setSubscriptionStats] = useState<{ plan: string; count: number; revenue: number }[]>([]);
  const [platformGrowth, setPlatformGrowth] = useState<{ month: string; cafes: number; revenue: number }[]>([]);
  const [recentSignups, setRecentSignups] = useState<{ name: string; owner: string; date: string; status: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlatformStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await analyticsApi.getPlatformStats();
      if (response.data.success) {
        setPlatformStats(response.data.data);
      }
    } catch (err) {
      console.error('Fetch platform stats error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCafePerformance = useCallback(async () => {
    try {
      const response = await analyticsApi.getCafePerformance();
      if (response.data.success) {
        setCafePerformance(response.data.data);
      }
    } catch (err) {
      console.error('Fetch cafe performance error:', err);
    }
  }, []);

  const fetchSubscriptionStats = useCallback(async () => {
    try {
      const response = await analyticsApi.getSubscriptionStats();
      if (response.data.success) {
        setSubscriptionStats(response.data.data);
      }
    } catch (err) {
      console.error('Fetch subscription stats error:', err);
    }
  }, []);

  const fetchPlatformGrowth = useCallback(async () => {
    try {
      const response = await analyticsApi.getPlatformGrowth();
      if (response.data.success) {
        setPlatformGrowth(response.data.data);
      }
    } catch (err) {
      console.error('Fetch platform growth error:', err);
    }
  }, []);

  const fetchRecentSignups = useCallback(async () => {
    try {
      const response = await analyticsApi.getRecentSignups();
      if (response.data.success) {
        setRecentSignups(response.data.data);
      }
    } catch (err) {
      console.error('Fetch recent signups error:', err);
    }
  }, []);

  useEffect(() => {
    fetchPlatformStats();
    fetchCafePerformance();
    fetchSubscriptionStats();
    fetchPlatformGrowth();
    fetchRecentSignups();
  }, [fetchPlatformStats, fetchCafePerformance, fetchSubscriptionStats, fetchPlatformGrowth, fetchRecentSignups]);

  return {
    platformStats,
    cafePerformance,
    subscriptionStats,
    platformGrowth,
    recentSignups,
    isLoading,
    fetchPlatformStats,
    fetchCafePerformance,
    fetchSubscriptionStats,
    fetchPlatformGrowth,
    fetchRecentSignups,
  };
};

export default useAnalytics;
