// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CafesPage from './pages/customer/CafesPage';
import CafePage from './pages/customer/CafePage';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import CustomerProfile from './pages/customer/CustomerProfile';
import OwnerDashboard from './pages/dashboard/owner/OwnerDashboard';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/cafes" element={<CafesPage />} />
                        <Route path="/cafe/:slug" element={<CafePage />} />

                        {/* Customer Protected */}
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <CustomerProfile />
                            </ProtectedRoute>
                        } />
                        <Route path="/order-confirmation/:orderId" element={
                            <ProtectedRoute>
                                <OrderConfirmation />
                            </ProtectedRoute>
                        } />

                        {/* Owner Dashboard */}
                        <Route path="/dashboard/owner/*" element={
                            <ProtectedRoute role="owner">
                                <OwnerDashboard />
                            </ProtectedRoute>
                        } />

                        {/* Admin Dashboard */}
                        <Route path="/dashboard/admin/*" element={
                            <ProtectedRoute role="admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}