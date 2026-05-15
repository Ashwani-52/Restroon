// src/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  // ─── Still loading — show spinner, DON'T redirect ─
  if (loading) {
    return (
      <div className="min-h-screen retro-grid flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🛵</div>
          <p className="font-bangers text-3xl text-ink">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── Not logged in — save current path, redirect to login ─
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ─── Wrong role ────────────────────────────────────────────
  if (role && user.role !== role) {
    const dashboardMap = {
      admin           : '/dashboard/admin',
      owner           : '/dashboard/owner',
      customer        : '/cafes',
      delivery_partner: '/delivery/dashboard'
    };
    return <Navigate to={dashboardMap[user.role] || '/'} replace />;
  }

  return children;
}