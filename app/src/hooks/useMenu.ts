// OrderSmartly - Menu Hook
import { useState, useEffect, useCallback } from 'react';
import { categoryApi, productApi } from '@/services/api';
import { useSocketEvent } from '@/context/SocketContext';
import type { Category, Product } from '@/types';
import { toast } from 'sonner';

interface UseMenuOptions {
  cafeId?: string;
  categoryId?: string;
  search?: string;
  onlyAvailable?: boolean;
  autoRefresh?: boolean;
}

export const useMenu = (options: UseMenuOptions = {}) => {
  const { cafeId, categoryId, search, onlyAvailable = false, autoRefresh = true } = options;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!cafeId) return;
    
    try {
      const response = await categoryApi.getAll(cafeId);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  }, [cafeId]);

  const fetchProducts = useCallback(async () => {
    if (!cafeId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const params: Record<string, unknown> = { cafeId };
      if (categoryId) params.category = categoryId;
      if (search) params.search = search;
      if (onlyAvailable) params.isAvailable = true;
      
      const response = await productApi.getAll(params);
      
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to fetch products';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [cafeId, categoryId, search, onlyAvailable]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  // Real-time updates
  useSocketEvent('menu-updated', (data) => {
    if (autoRefresh && data.cafeId === cafeId) {
      fetchProducts();
    }
  }, [cafeId, autoRefresh, fetchProducts]);

  const createCategory = useCallback(async (data: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await categoryApi.create(data);
      if (response.data.success) {
        setCategories((prev) => [...prev, response.data.data]);
        toast.success('Category created');
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create category');
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    try {
      const response = await categoryApi.update(id, data);
      if (response.data.success) {
        setCategories((prev) =>
          prev.map((cat) => (cat._id === id ? response.data.data : cat))
        );
        toast.success('Category updated');
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update category');
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await categoryApi.delete(id);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      toast.success('Category deleted');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to delete category');
      throw err;
    }
  }, []);

  const createProduct = useCallback(async (data: FormData) => {
    try {
      const response = await productApi.create(data);
      if (response.data.success) {
        setProducts((prev) => [...prev, response.data.data]);
        toast.success('Product created');
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create product');
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: FormData) => {
    try {
      const response = await productApi.update(id, data);
      if (response.data.success) {
        setProducts((prev) =>
          prev.map((prod) => (prod._id === id ? response.data.data : prod))
        );
        toast.success('Product updated');
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update product');
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productApi.delete(id);
      setProducts((prev) => prev.filter((prod) => prod._id !== id));
      toast.success('Product deleted');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to delete product');
      throw err;
    }
  }, []);

  const toggleProductAvailability = useCallback(async (id: string) => {
    try {
      const response = await productApi.toggleAvailability(id);
      if (response.data.success) {
        setProducts((prev) =>
          prev.map((prod) =>
            prod._id === id ? response.data.data : prod
          )
        );
        toast.success(
          response.data.data.isAvailable
            ? 'Product is now available'
            : 'Product is now unavailable'
        );
        return response.data.data;
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to toggle availability');
      throw err;
    }
  }, []);

  return {
    categories,
    products,
    isLoading,
    error,
    fetchCategories,
    fetchProducts,
    createCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
  };
};

export default useMenu;
