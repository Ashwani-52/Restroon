// src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen retro-grid flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl animate-bounce mb-4">🛵</div>
                <p className="font-bangers text-3xl text-ink">Loading...</p>
            </div>
        </div>
    );

    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <Navigate to="/" replace />;

    return children;
}