// src/components/common/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartoonButton } from '../ui/CartoonButton';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // ─── Role-based dashboard link ──────────────
    const dashboardLink = {
        admin: '/dashboard/admin',
        owner: '/dashboard/owner',
        customer: '/cafes',
        delivery_partner: '/delivery/dashboard'
    }[user?.role];

    return (
        <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled
                ? 'bg-cream/95 backdrop-blur-sm border-b-3 border-ink shadow-[0_4px_0_#1A1A1A]'
                : 'bg-transparent'
            }
    `}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow border-3 border-ink rounded-full flex items-center justify-center shadow-[3px_3px_0_#1A1A1A]">
                        <span className="text-xl">🛵</span>
                    </div>
                    <span className="font-bangers text-3xl tracking-wider text-ink">RESTROON</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="font-grotesk font-semibold hover:text-orange transition-colors">Features</a>
                    <a href="#how-it-works" className="font-grotesk font-semibold hover:text-orange transition-colors">How It Works</a>
                    <a href="#pricing" className="font-grotesk font-semibold hover:text-orange transition-colors">Pricing</a>
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        // ─── Logged In State ──────────────
                        <>
                            <Link to={dashboardLink}>
                                <CartoonButton
                                    label={`${user.role === 'owner' ? '🏪' : user.role === 'admin' ? '👑' : user.role === 'delivery_partner' ? '🛵' : '🍽️'} ${user.name?.split(' ')[0]}`}
                                    color="bg-yellow"
                                    size="sm"
                                />
                            </Link>
                            {user.role === 'customer' && (
                                <Link to="/profile">
                                    <CartoonButton label="👤 Profile" color="bg-white" size="sm" />
                                </Link>
                            )}
                            <CartoonButton
                                label="Logout"
                                color="bg-red"
                                size="sm"
                                onClick={handleLogout}
                            />
                        </>
                    ) : (
                        // ─── Logged Out State ─────────────
                        <>
                            <Link to="/login">
                                <CartoonButton label="Login" color="bg-white" size="sm" />
                            </Link>
                            <Link to="/register">
                                <CartoonButton label="Get Started" color="bg-yellow" size="sm" />
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden font-bangers text-2xl"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div className="md:hidden bg-cream border-t-3 border-ink px-6 py-4 flex flex-col gap-4">
                    <a href="#features" className="font-grotesk font-semibold">Features</a>
                    <a href="#how-it-works" className="font-grotesk font-semibold">How It Works</a>
                    <a href="#pricing" className="font-grotesk font-semibold">Pricing</a>
                    {user ? (
                        <>
                            <Link to={dashboardLink}>
                                <CartoonButton label="Dashboard" color="bg-yellow" size="sm" />
                            </Link>
                            <CartoonButton label="Logout" color="bg-red" size="sm" onClick={handleLogout} />
                        </>
                    ) : (
                        <>
                            <Link to="/login">    <CartoonButton label="Login" color="bg-white" size="sm" /></Link>
                            <Link to="/register"> <CartoonButton label="Get Started" color="bg-yellow" size="sm" /></Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}