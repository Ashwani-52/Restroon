// OrderSmartly - Inventory Hook
import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '@/services/api';
import { useSocketEvent } from '@/context/SocketContext';
import type { InventoryItem, InventoryLog } from '@/types';
import { toast } from 'sonner';

interface UseInventoryOptions {
  cafeId?: string;
  showLowStock?: boolean;
  autoRefresh?: boolean;
}

export const useInventory = (options: UseInventoryOptions = {}) => {
  const { cafeId, showLowStock = false, autoRefresh = true } = options;
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!cafeId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await inventoryApi.getAll(cafeId);
      
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to fetch inventory';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [cafeId]);

  const fetchLowStock = useCallback(async () => {
    if (!cafeId) return;
    
    try {
      const response = await inventoryApi.getLowStock(cafeId);
      if (response.data.success) {
        setLowStockItems(response.data.data);
      }
    } catch (err) {
      console.error('Fetch low stock error:', err);
    }
  }, [cafeId]);

  // Initial fetch
  useEffect(() => {
    fetchItems();
    if (showLowStock) {
      fetchLowStock();
    }
  }, [fetchItems, fetchLowStock, showLowStock]);

  // Real-time updates
  useSocketEvent('inventory-alert', (item) => {
    if (autoRefresh) {
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? item : i))
      );
      fetchLowStock();
    }
  }, [autoRefresh, fetchLowStock]);

  const createItem = useCallback(async (data: Omit<InventoryItem, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await inventoryApi.create(data);
      if (response.data.success) {
        setItems((prev) => [...prev, response.data.data]);
        toast.success('Inventory item created');
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create item');
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id: string, data: Partial<InventoryItem>) => {
    try {
      const response = await inventoryApi.update(id, data);
      if (response.data.success) {
        setItems((prev) =>
          prev.map((item) => (item._id === id ? response.data.data : item))
        );
        toast.success('Inventory item updated');
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update item');
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await inventoryApi.delete(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success('Inventory item deleted');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to delete item');
      throw err;
    }
  }, []);

  const addStock = useCallback(async (id: string, quantity: number, reason: string) => {
    try {
      const response = await inventoryApi.addStock(id, quantity, reason);
      if (response.data.success) {
        // Refresh items to get updated stock
        await fetchItems();
        toast.success(`Added ${quantity} units to stock`);
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to add stock');
      throw err;
    }
  }, [fetchItems]);

  const removeStock = useCallback(async (id: string, quantity: number, reason: string, orderId?: string) => {
    try {
      const response = await inventoryApi.removeStock(id, quantity, reason, orderId);
      if (response.data.success) {
        // Refresh items to get updated stock
        await fetchItems();
        toast.success(`Removed ${quantity} units from stock`);
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to remove stock');
      throw err;
    }
  }, [fetchItems]);

  const getLogs = useCallback(async (itemId: string) => {
    try {
      const response = await inventoryApi.getLogs(itemId);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Get logs error:', err);
      return [];
    }
  }, []);

  return {
    items,
    lowStockItems,
    isLoading,
    error,
    fetchItems,
    fetchLowStock,
    createItem,
    updateItem,
    deleteItem,
    addStock,
    removeStock,
    getLogs,
  };
};

export default useInventory;
