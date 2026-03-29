// src/components/landing/HeroSection.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ComicText } from '../ui/ComicText';
import { CartoonButton } from '../ui/CartoonButton';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnimatedHeroScene from './AnimatedHeroScene';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

function MobileHeroAnimation() {
    const menuItems = [
        { emoji: '🍕', name: 'Margherita Pizza', price: '₹199', color: 'bg-yellow' },
        { emoji: '🍔', name: 'Smash Burger', price: '₹149', color: 'bg-orange' },
        { emoji: '☕', name: 'Masala Chai', price: '₹30', color: 'bg-yellow' },
        { emoji: '🍛', name: 'Chicken Biryani', price: '₹249', color: 'bg-red' },
        { emoji: '🥘', name: 'Dal Makhani', price: '₹180', color: 'bg-orange' },
    ];

    return (
        <div className="w-full h-full bg-cream overflow-hidden relative">

            {/* Cafe Header */}
            <div className="bg-gradient-to-r from-yellow to-orange p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-cream border-3 border-ink rounded-xl flex items-center justify-center text-2xl shadow-[2px_2px_0_#1A1A1A]">
                    🏪
                </div>
                <div>
                    <p className="font-bangers text-xl text-ink">CHAI WALA</p>
                    <div className="flex items-center gap-2">
                        <span className="bg-green-400 text-ink text-xs font-bangers px-2 py-0.5 rounded-full border border-ink">
                            ✅ OPEN
                        </span>
                        <span className="font-mono text-xs text-ink/60">⭐ 4.8 • 2km</span>
                    </div>
                </div>
            </div>

            {/* Menu Items — animated scroll */}
            <div className="p-3 space-y-2 overflow-hidden">
                <p className="font-bangers text-sm text-ink/60">🍽️ MENU</p>
                {menuItems.map((item, i) => (
                    <motion.div
                        key={item.name}
                        className={`${item.color} border-2 border-ink rounded-xl p-3 flex items-center justify-between shadow-[2px_2px_0_#1A1A1A]`}
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            delay: i * 0.15,
                            duration: 0.4,
                            ease: 'easeOut'
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{item.emoji}</span>
                            <span className="font-bangers text-sm text-ink">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bangers text-sm text-ink">{item.price}</span>
                            <motion.button
                                className="bg-ink text-cream text-xs font-bangers px-2 py-1 rounded-lg"
                                whileTap={{ scale: 0.9 }}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ delay: i * 0.15 + 0.5, duration: 0.3 }}
                            >
                                +ADD
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Order Button at bottom */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 p-3 bg-cream border-t-2 border-ink"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
            >
                <motion.button
                    className="w-full bg-yellow border-3 border-ink rounded-xl py-3 font-bangers text-xl text-ink shadow-[3px_3px_0_#1A1A1A]"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    🛵 Place Order • ₹378
                </motion.button>
            </motion.div>
        </div>
    );
}

// ── Typewriter Hook ────────────────────────────
function useTypewriter(words, speed = 80) {
    const [text, setText] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const current = words[wordIndex];
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setText(current.substring(0, charIndex + 1));
                setCharIndex(c => c + 1);
                if (charIndex + 1 === current.length) {
                    setTimeout(() => setIsDeleting(true), 1500);
                }
            } else {
                setText(current.substring(0, charIndex - 1));
                setCharIndex(c => c - 1);
                if (charIndex - 1 === 0) {
                    setIsDeleting(false);
                    setWordIndex(w => (w + 1) % words.length);
                }
            }
        }, isDeleting ? speed / 2 : speed);
        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, wordIndex, words, speed]);

    return text;
}

export default function HeroSection() {
    const { user } = useAuth();
    const isMobile = useIsMobile();
    const typeText = useTypewriter([
        'Restaurant Online',
        'Cafe Digital',
        'Menu Live',
        'Orders Easy'
    ]);

    return (
        <section className="relative min-h-screen retro-grid overflow-hidden flex items-center">

            {/* ── Stripe Banner Top ── */}
            <div className="absolute top-0 left-0 right-0 h-3 stripe-bg z-10" />

            {/* ── Floating Stars ── */}
            {['⭐', '✨', '💥', '🌟', '⚡'].map((star, i) => (
                <motion.div
                    key={i}
                    className="absolute text-3xl pointer-events-none"
                    style={{
                        top: `${15 + i * 15}%`,
                        left: i % 2 === 0 ? `${3 + i * 2}%` : undefined,
                        right: i % 2 !== 0 ? `${3 + i * 2}%` : undefined,
                    }}
                    animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {star}
                </motion.div>
            ))}

            {/* ── Main Content ── */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* ── Left — Text ── */}
                <motion.div
                    className="flex flex-col gap-6"
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    {/* Tag */}
                    <motion.div
                        className="inline-flex items-center gap-2 bg-red text-cream px-4 py-2 rounded-full border-3 border-ink shadow-[3px_3px_0_#1A1A1A] w-fit"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="text-lg">🛵</span>
                        <span className="font-bangers tracking-wider text-lg">
                            Why pay 30–40% commissions when you don’t have to?
                        </span>
                    </motion.div>

                    {/* Comic Main Title */}
                    <ComicText fontSize={4}>RESTROON</ComicText>

                    {/* Typewriter */}
                    <div className="bg-ink rounded-2xl border-3 border-ink px-6 py-4 shadow-[6px_6px_0_#FF3B30] flex items-center gap-3">
                        <div className="w-4 h-4 bg-orange rounded-sm animate-pulse" />
                        <span className="font-mono text-cream text-xl font-bold">
                            Get Your {typeText}
                            <span className="cursor text-yellow ml-1">|</span>
                        </span>
                    </div>

                    {/* Subtitle */}
                    <p className="font-grotesk text-lg text-ink/80 max-w-lg leading-relaxed">
                        Restroon helps local cafes and restaurants go online{' '}
                        <strong>without giving 30% margin</strong> to food giants.
                        Your brand. Your prices. Your customers.
                    </p>

                    {/* ── CTAs — Dynamic based on login state ── */}
                    <div className="flex flex-wrap gap-4">

                        {/* Not logged in */}
                        {!user && (
                            <>
                                <Link to="/register?role=owner">
                                    <CartoonButton
                                        label="🏪 Register Your Cafe"
                                        color="bg-yellow"
                                        size="lg"
                                    />
                                </Link>
                                <a href="#features">
                                    <CartoonButton
                                        label="See How It Works →"
                                        color="bg-white"
                                        size="lg"
                                    />
                                </a>
                            </>
                        )}

                        {/* Cafe Owner */}
                        {user?.role === 'owner' && (
                            <>
                                <Link to="/dashboard/owner">
                                    <CartoonButton
                                        label="🏪 My Dashboard"
                                        color="bg-yellow"
                                        size="lg"
                                    />
                                </Link>
                                <Link to="/dashboard/owner/menu">
                                    <CartoonButton
                                        label="🍽️ Manage Menu"
                                        color="bg-orange"
                                        size="lg"
                                    />
                                </Link>
                            </>
                        )}

                        {/* Customer */}
                        {user?.role === 'customer' && (
                            <>
                                <Link to="/cafes">
                                    <CartoonButton
                                        label="🍕 Order Food Now"
                                        color="bg-yellow"
                                        size="lg"
                                    />
                                </Link>
                                <Link to="/cafes">
                                    <CartoonButton
                                        label="🔍 Browse Cafes"
                                        color="bg-white"
                                        size="lg"
                                    />
                                </Link>
                            </>
                        )}

                        {/* Super Admin */}
                        {user?.role === 'admin' && (
                            <>
                                <Link to="/dashboard/admin">
                                    <CartoonButton
                                        label="👑 Admin Panel"
                                        color="bg-yellow"
                                        size="lg"
                                    />
                                </Link>
                                <Link to="/dashboard/admin/cafes">
                                    <CartoonButton
                                        label="🏪 Manage Cafes"
                                        color="bg-orange"
                                        size="lg"
                                    />
                                </Link>
                            </>
                        )}

                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 pt-4">
                        {[
                            { num: '4%', label: 'Commission' },
                            { num: '∞', label: 'Customization' },
                            { num: '24/7', label: 'Support' }
                        ].map(({ num, label }) => (
                            <div key={label} className="text-center">
                                <div className="font-bangers text-4xl text-orange">{num}</div>
                                <div className="font-grotesk text-sm font-semibold text-ink/70">{label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Right — Spline 3D Frame ── */}
                <motion.div
                    className="relative h-[500px] lg:h-[600px]"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    {/* Frame */}
                    <div className="absolute inset-0 rounded-3xl border-4 border-ink shadow-[12px_12px_0_#1A1A1A] overflow-hidden bg-gradient-to-br from-sky-200 via-green-100 to-yellow-100">

                        {/* Browser Bar */}
                        <div className="bg-ink px-4 py-2 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red border border-ink" />
                            <div className="w-3 h-3 rounded-full bg-yellow border border-ink" />
                            <div className="w-3 h-3 rounded-full bg-green-400 border border-ink" />
                            <span className="font-mono text-xs text-cream/60 ml-2">
                                restroon.app/chai-wala
                            </span>
                        </div>

                        {/* Content */}
                        <div className="w-full h-[calc(100%-36px)]">
                            {isMobile ? (
                                // ── Mobile: Lightweight CSS Animation ──
                                <MobileHeroAnimation />
                            ) : (
                                // ── Desktop: Canvas Frame Animation ──
                                <AnimatedHeroScene />
                            )}
                        </div>
                    </div>

                    {/* Floating Badge — Top Right */}
                    <motion.div
                        className="absolute -top-4 -right-4 bg-yellow border-3 border-ink rounded-xl px-4 py-2 shadow-[4px_4px_0_#1A1A1A] z-20"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <span className="font-bangers text-xl">🍕 ORDER NOW!</span>
                    </motion.div>

                    {/* Floating Badge — Bottom Left */}
                    <motion.div
                        className="absolute -bottom-4 -left-4 bg-red text-cream border-3 border-ink rounded-xl px-4 py-2 shadow-[4px_4px_0_#1A1A1A] z-20"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    >
                        <span className="font-bangers text-xl">⚡ FAST DELIVERY</span>
                    </motion.div>
                </motion.div>

            </div>

            {/* ── Floating Keyword Banner ── */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden py-3 bg-ink border-t-3 border-ink">
                <div className="flex animate-marquee whitespace-nowrap gap-8">
                    {Array(8)
                        .fill(['RESTROON', '🛵', 'YOUR CAFE', '⭐', 'LOW COMMISSION', '🍕', 'GO ONLINE', '💥'])
                        .flat()
                        .map((w, i) => (
                            <span key={i} className="font-bangers text-xl text-yellow tracking-widest">
                                {w}
                            </span>
                        ))
                    }
                </div>
            </div>

            {/* ── Stripe Banner Bottom ── */}
            <div className="absolute bottom-12 left-0 right-0 h-2 stripe-bg" />

        </section>
    );
}
