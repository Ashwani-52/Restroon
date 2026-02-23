// OrderSmartly - Orders Hook
import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '@/services/api';
import { useSocketEvent } from '@/context/SocketContext';
import type { Order, OrderStatus, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

interface UseOrdersOptions {
  cafeId?: string;
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: string;
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
}

export const useOrders = (options: UseOrdersOptions = {}) => {
  const { cafeId, status, paymentStatus, page = 1, limit = 20, autoRefresh = true } = options;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Order>['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!cafeId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const params: Record<string, unknown> = { cafeId, page, limit };
      if (status) params.status = Array.isArray(status) ? status.join(',') : status;
      if (paymentStatus) params.paymentStatus = paymentStatus;
      
      const response = await orderApi.getAll(params);
      
      if (response.data.success) {
        setOrders(response.data.data.data);
        setPagination(response.data.data.pagination);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to fetch orders';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [cafeId, status, paymentStatus, page, limit]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time updates
  useSocketEvent('new-order', (order) => {
    if (autoRefresh && order.cafe === cafeId) {
      setOrders((prev) => [order, ...prev]);
      toast.info(`New order: #${order.orderNumber}`);
    }
  }, [cafeId, autoRefresh]);

  useSocketEvent('order-updated', (updatedOrder) => {
    if (autoRefresh && updatedOrder.cafe === cafeId) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    }
  }, [cafeId, autoRefresh]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      const response = await orderApi.updateStatus(orderId, status);
      
      if (response.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? response.data.data : order
          )
        );
        toast.success(`Order status updated to ${status}`);
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update order');
      throw err;
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: string, reason?: string) => {
    try {
      const response = await orderApi.cancel(orderId, reason);
      
      if (response.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? response.data.data : order
          )
        );
        toast.success('Order cancelled');
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to cancel order');
      throw err;
    }
  }, []);

  const getActiveOrders = useCallback(async () => {
    if (!cafeId) return [];
    
    try {
      const response = await orderApi.getActiveOrders(cafeId);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Get active orders error:', err);
      return [];
    }
  }, [cafeId]);

  return {
    orders,
    pagination,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    cancelOrder,
    getActiveOrders,
  };
};

export default useOrders;
