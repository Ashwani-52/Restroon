// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider }          from './context/CartContext';
import { ProtectedRoute }        from './routes/ProtectedRoute';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import LandingPage       from './pages/LandingPage';
import Login             from './pages/auth/Login';
import Register          from './pages/auth/Register';
import CafesPage         from './pages/customer/CafesPage';
import CafePage          from './pages/customer/CafePage';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import CustomerProfile   from './pages/customer/CustomerProfile';
import OwnerDashboard    from './pages/dashboard/owner/OwnerDashboard';
import AdminDashboard    from './pages/dashboard/admin/AdminDashboard';
import PrivacyPolicy     from './pages/PrivacyPolicy';
import About             from './pages/About';
import Contact           from './pages/Contact';
import { Terms, RefundPolicy, CookiePolicy, FAQ } from './pages/LegalPages';
import BlogList          from './pages/blog/BlogList';
import BlogPost          from './pages/blog/BlogPost';
import MaintenancePage   from './pages/MaintenancePage'; // ← ADD
// ── Redirect logged-in users away from login/register ──
function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen retro-grid flex items-center justify-center">
        <div className="text-6xl animate-bounce mb-4">🛵</div>
      </div>
    );
  }

  if (user) {
    const redirect = {
      admin   : '/dashboard/admin',
      owner   : '/dashboard/owner',
      customer: '/cafes'
    };
    return <Navigate to={redirect[user.role] || '/'} replace />;
  }

  return children;
}

function NotFound() {
  return (
    <div className="min-h-screen retro-grid flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-4">😔</div>
        <p className="font-bangers text-5xl text-ink">404</p>
        <p className="font-bangers text-2xl text-ink/60 mt-2">Page not found</p>
        <a href="/" className="font-grotesk text-orange underline mt-4 block text-lg">← Go Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>

            {/* ─── PUBLIC — anyone can access ────── */}
            <Route path="/"           element={<LandingPage />} />
            <Route path="/cafes"      element={<CafesPage />} />
            <Route path="/cafe/:slug" element={<CafePage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            
            <Route path="/about"      element={<About />} />
            <Route path="/contact"    element={<Contact />} />
            <Route path="/blog"       element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            <Route path="/privacy"       element={<PrivacyPolicy />} />
            <Route path="/terms"         element={<Terms />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/faq"           element={<FAQ />} />
            {/* ─── AUTH — redirect if logged in ─── */}
            <Route path="/login"    element={<AuthGuard><Login /></AuthGuard>} />
            <Route path="/register" element={<AuthGuard><Register /></AuthGuard>} />

            {/* ─── PROTECTED — need login ────────── */}
            <Route path="/profile" element={
              <ProtectedRoute><CustomerProfile /></ProtectedRoute>
            } />
            <Route path="/order-confirmation/:orderId" element={
              <ProtectedRoute><OrderConfirmation /></ProtectedRoute>
            } />

            {/* ─── OWNER DASHBOARD ───────────────── */}
            <Route path="/dashboard/owner/*" element={
              <ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>
            } />

            {/* ─── ADMIN DASHBOARD ───────────────── */}
            <Route path="/dashboard/admin/*" element={
              <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
            } />

            {/* ─── 404 ───────────────────────────── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
          <Analytics />
          <SpeedInsights />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}