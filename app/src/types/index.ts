// Restroon - Type Definitions

// ==================== USER TYPES ====================
export type UserRole = 'super_admin' | 'cafe_owner' | 'customer';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ==================== CAFE TYPES ====================
export interface Cafe {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  owner: string;
  isActive: boolean;
  settings: {
    openingTime: string;
    closingTime: string;
    currency: string;
    taxRate: number;
  };
  paymentDetails?: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

// ==================== MENU & PRODUCT TYPES ====================
export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  cafe: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  image?: string;
  category: Category | string;
  cafe: string;
  isAvailable: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  preparationTime?: number;
  ingredients?: string[];
  addons?: Addon[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Addon {
  name: string;
  price: number;
}

export interface ProductVariant {
  name: string;
  price: number;
}

// ==================== ORDER TYPES ====================
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export interface OrderItem {
  product: Product | string;
  name: string;
  quantity: number;
  price: number;
  addons?: string[];
  variant?: string;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  cafe: Cafe | string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  tableNumber?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== PAYMENT TYPES ====================
export interface PaymentDetails {
  upiId?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
}

// ==================== INVENTORY TYPES ====================
export interface InventoryItem {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  costPerUnit: number;
  cafe: string;
  supplier?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  _id: string;
  item: InventoryItem | string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  order?: string;
  createdBy: string;
  createdAt: string;
}

// ==================== SUBSCRIPTION TYPES ====================
export type PlanType = 'starter' | 'professional' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  _id: string;
  name: string;
  type: PlanType;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    maxProducts: number;
    maxOrders: number;
    maxStaff: number;
  };
  isActive: boolean;
}

export interface Subscription {
  _id: string;
  cafe: string;
  plan: SubscriptionPlan | string;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== ANALYTICS TYPES ====================
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  lowStockItems: number;
  activeCustomers: number;
}

export interface SalesData {
  date: string;
  orders: number;
  revenue: number;
}

export interface TopProduct {
  product: Product;
  totalSold: number;
  totalRevenue: number;
}

export interface PlatformStats {
  totalCafes: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeCafes?: number;
  activeSubscriptions?: number;
  pendingSubscriptions?: number;
}

// ==================== NOTIFICATION TYPES ====================
export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'inventory' | 'system';
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// ==================== SOCKET EVENT TYPES ====================
export interface SocketEvents {
  // Client to Server
  'join-cafe': (cafeId: string) => void;
  'join-order': (orderId: string) => void;

  // Server to Client
  'new-order': (order: Order) => void;
  'order-updated': (order: Order) => void;
  'payment-received': (data: { orderId: string; status: PaymentStatus }) => void;
  'inventory-alert': (item: InventoryItem) => void;
  'menu-updated': (data: { cafeId: string; product: Product }) => void;
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ==================== FORM TYPES ====================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export interface CreateCafeFormData {
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
}

export interface CreateProductFormData {
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  category: string;
  image?: File;
  isAvailable: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  preparationTime?: number;
  ingredients?: string[];
  addons?: Addon[];
  variants?: ProductVariant[];
}

export interface CreateOrderFormData {
  items: {
    product: string;
    quantity: number;
    addons?: string[];
    variant?: string;
    notes?: string;
  }[];
  orderType: OrderType;
  tableNumber?: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  notes?: string;
}
