// OrderSmartly - API Service Layer (Backend-Aligned)
import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  AuthResponse,
  User,
  Cafe,
  Category,
  Product,
  Order,
  InventoryItem,
  SubscriptionPlan,
  Subscription,
  DashboardStats,
  SalesData,
  TopProduct,
  PlatformStats,
  Notification,
  CreateCafeFormData,
  PaymentDetails
} from '@/types';

// ==================== AXIOS INSTANCE ====================
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ==================== REQUEST INTERCEPTOR ====================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    const cafeId = localStorage.getItem('currentCafeId');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add cafeId for multi-tenant requests
    if (cafeId && config.headers) {
      config.headers['X-Cafe-Id'] = cafeId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post<ApiResponse<AuthResponse>>(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('currentCafeId');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API (Google OAuth Aligned) ====================
export const authApi = {
  // Google OAuth Login
  googleLogin: (idToken: string, role?: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/google-login', { idToken, role }),

  // Traditional login (fallback)
  login: (email: string, password: string, role?: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password, role }),

  // Register
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  logout: () =>
    apiClient.post<ApiResponse<void>>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken }),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    apiClient.put<ApiResponse<User>>('/auth/profile', data),
};

// ==================== CAFE API ====================
export const cafeApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Cafe>>>('/cafes', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Cafe>>(`/cafes/${id}`),

  getMyCafe: () =>
    apiClient.get<ApiResponse<Cafe>>('/cafes/my-cafe'),

  create: (data: CreateCafeFormData) =>
    apiClient.post<ApiResponse<Cafe>>('/cafes', data),

  update: (id: string, data: Partial<CreateCafeFormData>) =>
    apiClient.put<ApiResponse<Cafe>>(`/cafes/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/cafes/${id}`),

  toggleStatus: (id: string) =>
    apiClient.patch<ApiResponse<Cafe>>(`/cafes/${id}/toggle-status`),

  updateSettings: (id: string, data: Cafe['settings']) =>
    apiClient.put<ApiResponse<Cafe>>(`/cafes/${id}/settings`, data),

  updatePaymentDetails: (id: string, data: PaymentDetails) =>
    apiClient.put<ApiResponse<Cafe>>(`/cafes/${id}/payment-details`, data),
};

// ==================== CATEGORY API ====================
export const categoryApi = {
  getAll: (cafeId: string) =>
    apiClient.get<ApiResponse<Category[]>>(`/categories`, { params: { cafeId } }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Category>>(`/categories/${id}`),

  create: (data: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<ApiResponse<Category>>('/categories', data),

  update: (id: string, data: Partial<Category>) =>
    apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/categories/${id}`),

  reorder: (cafeId: string, categoryIds: string[]) =>
    apiClient.put<ApiResponse<void>>('/categories/reorder', { cafeId, categoryIds }),
};

// ==================== PRODUCT API ====================
export const productApi = {
  getAll: (params?: { cafeId?: string; category?: string; search?: string; isAvailable?: boolean }) =>
    apiClient.get<ApiResponse<Product[]>>('/products', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/${id}`),

  create: (data: FormData) =>
    apiClient.post<ApiResponse<Product>>('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: FormData) =>
    apiClient.put<ApiResponse<Product>>(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/products/${id}`),

  toggleAvailability: (id: string) =>
    apiClient.patch<ApiResponse<Product>>(`/products/${id}/toggle-availability`),

  updateStock: (id: string, quantity: number) =>
    apiClient.patch<ApiResponse<Product>>(`/products/${id}/stock`, { quantity }),
};

// ==================== ORDER API (UI-Synced Status) ====================
export const orderApi = {
  getAll: (params?: {
    cafeId?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Order>>>('/orders', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/${id}`),

  getByOrderNumber: (orderNumber: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/number/${orderNumber}`),

  create: (data: { items: Array<{ product: string; quantity: number; addons?: string[]; variant?: string; notes?: string }>; orderType: string; tableNumber?: string; customer?: { name: string; phone: string; email?: string }; notes?: string }) =>
    apiClient.post<ApiResponse<Order>>('/orders', data),

  // Status: PENDING → PREPARING → READY → COMPLETED
  updateStatus: (id: string, status: Order['status']) =>
    apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status }),

  updatePaymentStatus: (id: string, paymentStatus: Order['paymentStatus'], transactionId?: string) =>
    apiClient.patch<ApiResponse<Order>>(`/orders/${id}/payment`, { paymentStatus, transactionId }),

  cancel: (id: string, reason?: string) =>
    apiClient.patch<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason }),

  getActiveOrders: (cafeId: string) =>
    apiClient.get<ApiResponse<Order[]>>(`/orders/active`, { params: { cafeId } }),

  getTodayOrders: (cafeId: string) =>
    apiClient.get<ApiResponse<Order[]>>(`/orders/today`, { params: { cafeId } }),
};

// ==================== INVENTORY API ====================
export const inventoryApi = {
  getAll: (cafeId: string) =>
    apiClient.get<ApiResponse<InventoryItem[]>>(`/inventory`, { params: { cafeId } }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<InventoryItem>>(`/inventory/${id}`),

  getLowStock: (cafeId: string) =>
    apiClient.get<ApiResponse<InventoryItem[]>>(`/inventory/low-stock`, { params: { cafeId } }),

  create: (data: Omit<InventoryItem, '_id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<ApiResponse<InventoryItem>>('/inventory', data),

  update: (id: string, data: Partial<InventoryItem>) =>
    apiClient.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/inventory/${id}`),

  addStock: (id: string, quantity: number, reason: string) =>
    apiClient.post<ApiResponse<unknown>>('/inventory/add-stock', { itemId: id, quantity, reason }),

  removeStock: (id: string, quantity: number, reason: string, orderId?: string) =>
    apiClient.post<ApiResponse<unknown>>('/inventory/remove-stock', { itemId: id, quantity, reason, orderId }),

  getLogs: (itemId: string) =>
    apiClient.get<ApiResponse<unknown[]>>(`/inventory/${itemId}/logs`),
};

// ==================== SUBSCRIPTION API ====================
export const subscriptionApi = {
  getPlans: () =>
    apiClient.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans'),

  getCurrent: (cafeId: string) =>
    apiClient.get<ApiResponse<Subscription>>(`/subscriptions/current`, { params: { cafeId } }),

  subscribe: (cafeId: string, planId: string, billingCycle: 'monthly' | 'yearly') =>
    apiClient.post<ApiResponse<Subscription>>('/subscriptions', { cafeId, planId, billingCycle }),

  upgrade: (subscriptionId: string, newPlanId: string) =>
    apiClient.patch<ApiResponse<Subscription>>(`/subscriptions/${subscriptionId}/upgrade`, { newPlanId }),

  cancel: (subscriptionId: string) =>
    apiClient.patch<ApiResponse<Subscription>>(`/subscriptions/${subscriptionId}/cancel`),

  renew: (subscriptionId: string) =>
    apiClient.patch<ApiResponse<Subscription>>(`/subscriptions/${subscriptionId}/renew`),
};

// ==================== ANALYTICS API ====================
export const analyticsApi = {
  getDashboardStats: (cafeId: string) =>
    apiClient.get<ApiResponse<DashboardStats>>(`/analytics/dashboard`, { params: { cafeId } }),

  getSalesData: (cafeId: string, period: 'day' | 'week' | 'month' | 'year') =>
    apiClient.get<ApiResponse<SalesData[]>>(`/analytics/sales`, { params: { cafeId, period } }),

  getTopProducts: (cafeId: string, limit?: number) =>
    apiClient.get<ApiResponse<TopProduct[]>>(`/analytics/top-products`, { params: { cafeId, limit } }),

  getRevenueByCategory: (cafeId: string) =>
    apiClient.get<ApiResponse<{ category: string; revenue: number }[]>>(`/analytics/revenue-by-category`, { params: { cafeId } }),

  getOrderStats: (cafeId: string, period: 'day' | 'week' | 'month' | 'year') =>
    apiClient.get<ApiResponse<{ date: string; pending: number; preparing: number; ready: number; completed: number }[]>>(`/analytics/order-stats`, { params: { cafeId, period } }),

  // Super Admin Analytics
  getPlatformStats: () =>
    apiClient.get<ApiResponse<PlatformStats>>('/analytics/platform'),

  getCafePerformance: () =>
    apiClient.get<ApiResponse<{ cafe: Cafe; orders: number; revenue: number }[]>>('/analytics/cafe-performance'),

  getSubscriptionStats: () =>
    apiClient.get<ApiResponse<{ plan: string; count: number; revenue: number }[]>>('/analytics/subscription-stats'),

  getPlatformGrowth: () =>
    apiClient.get<ApiResponse<{ month: string; cafes: number; revenue: number }[]>>('/analytics/platform-growth'),

  getRecentSignups: () =>
    apiClient.get<ApiResponse<{ name: string; owner: string; date: string; status: string }[]>>('/analytics/recent-signups'),
};

// ==================== NOTIFICATION API ====================
export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number; isRead?: boolean }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { params }),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.patch<ApiResponse<void>>('/notifications/read-all'),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/notifications/${id}`),
};

// ==================== UPLOAD API ====================
export const uploadApi = {
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    if (folder) formData.append('folder', folder);
    formData.append('image', file);

    return apiClient.post<ApiResponse<{ url: string }>>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (url: string) =>
    apiClient.post<ApiResponse<void>>('/upload/delete', { url }),
};

// ==================== USER API (Super Admin) ====================
export const userApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<User & { cafeCount?: number }>>>('/users', { params }),

  toggleBan: (id: string) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}/toggle-ban`),
};

// ==================== ADMIN SUBSCRIPTION API ====================
export const adminSubscriptionApi = {
  getPlans: () =>
    apiClient.get<ApiResponse<SubscriptionPlan[]>>('/admin/subscriptions/plans'),

  getAllSubscriptions: () =>
    apiClient.get<ApiResponse<{
      subscriptions: (Subscription & { cafeName: string; planName: string })[];
      stats: { totalSubscriptions: number; activeCount: number; expiringSoon: number; monthlyRevenue: number; };
    }>>('/admin/subscriptions'),

  seedPlans: () =>
    apiClient.post<ApiResponse<SubscriptionPlan[]>>('/admin/subscriptions/seed-plans'),

  seedTestSubscription: (cafeId: string) =>
    apiClient.post<ApiResponse<Subscription>>('/admin/subscriptions/seed-test-subscription', { cafeId }),
};

export default apiClient;
