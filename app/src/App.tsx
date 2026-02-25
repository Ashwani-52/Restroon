// Restroon - Main App Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { CafeProvider } from '@/context/CafeContext';
import ProtectedRoute, { CafeOwnerRoute, SuperAdminRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Public Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import CustomerPage from '@/pages/CustomerPage';

// Dashboard Pages (Cafe Owner)
import Dashboard from '@/pages/dashboard/Dashboard';
import Orders from '@/pages/dashboard/Orders';
import Menu from '@/pages/dashboard/Menu';
import Inventory from '@/pages/dashboard/Inventory';
import Analytics from '@/pages/dashboard/Analytics';

// Admin Pages (Super Admin)
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCafes from '@/pages/admin/AdminCafes';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';

// Shared Pages
import Profile from '@/pages/Profile';
import Help from '@/pages/Help';

import Settings from '@/pages/dashboard/Settings';
import Payments from '@/pages/dashboard/Payments';

// Placeholder components for pages not yet implemented
const Onboarding = () => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <h2 className="text-2xl font-bold mb-2">Welcome to Restroon!</h2>
    <p className="text-muted-foreground">Onboarding flow coming soon</p>
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-4xl font-bold mb-4">404</h1>
    <p className="text-muted-foreground mb-4">Page not found</p>
    <a href="/" className="text-primary hover:underline">
      Go back home
    </a>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <CafeProvider>
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  fontSize: '14px',
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Onboarding */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute requiredRoles={['cafe_owner']}>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* Customer Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute requiredRoles={['customer', 'cafe_owner', 'super_admin']}>
                    <CustomerPage />
                  </ProtectedRoute>
                }
              />

              {/* Cafe Owner Dashboard Routes */}
              <Route
                element={
                  <ProtectedRoute requiredRoles={['cafe_owner']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:orderId" element={<Orders />} />
                <Route path="menu" element={<Menu />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="payments" element={<Payments />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="help" element={<Help />} />
              </Route>

              {/* Super Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="cafes" element={<AdminCafes />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CafeProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
