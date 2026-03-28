// src/pages/customer/CafesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';

export default function CafesPage() {
    const [cafes, setCafes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/api/cafe?search=${search}`)
            .then(r => setCafes(r.data.cafes))
            .finally(() => setLoading(false));
    }, [search]);

    return (
        <div className="min-h-screen retro-grid">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">

                {/* Header */}
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="font-bangers text-6xl text-ink mb-3">
                        FIND YOUR <span className="text-orange">CAFE</span> 🍕
                    </h1>
                    {/* Search */}
                    <div className="relative max-w-xl mx-auto mt-6">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                        <input
                            type="text"
                            placeholder="Search cafes..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-cream border-3 border-ink rounded-2xl font-grotesk text-lg focus:outline-none focus:border-orange shadow-[4px_4px_0_#1A1A1A]"
                        />
                    </div>
                </motion.div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-6xl animate-bounce">🛵</div>
                    </div>
                ) : cafes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😔</div>
                        <p className="font-bangers text-3xl text-ink">No cafes found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cafes.map((cafe, i) => (
                            <motion.div
                                key={cafe._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link to={`/cafe/${cafe.slug}`}>
                                    <div className="bg-cream border-3 border-ink rounded-2xl overflow-hidden shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-2 hover:shadow-[8px_8px_0_#1A1A1A] transition-all duration-200 cursor-pointer">
                                        {/* Cover */}
                                        <div className="h-48 bg-gradient-to-br from-yellow to-orange flex items-center justify-center relative">
                                            {cafe.coverImage
                                                ? <img src={cafe.coverImage} alt={cafe.name} className="w-full h-full object-cover" />
                                                : <span className="text-7xl">🏪</span>
                                            }
                                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full border-2 border-ink font-bangers text-sm ${cafe.isOpen ? 'bg-green-400' : 'bg-red text-cream'}`}>
                                                {cafe.isOpen ? '✅ OPEN' : '❌ CLOSED'}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex items-center gap-3 mb-2">
                                                {cafe.logo
                                                    ? <img src={cafe.logo} className="w-10 h-10 rounded-full border-2 border-ink" alt="" />
                                                    : <div className="w-10 h-10 bg-yellow rounded-full border-2 border-ink flex items-center justify-center">🍽️</div>
                                                }
                                                <div>
                                                    <h3 className="font-bangers text-xl text-ink">{cafe.name}</h3>
                                                    <p className="font-mono text-xs text-ink/60">{cafe.address?.city}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {cafe.cuisine?.slice(0, 3).map(c => (
                                                    <span key={c} className="bg-yellow/60 border border-ink rounded-full px-2 py-0.5 font-grotesk text-xs">{c}</span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <span>⭐</span>
                                                    <span className="font-grotesk text-sm font-semibold">{cafe.ratings?.average?.toFixed(1) || '4.5'}</span>
                                                </div>
                                                <span className="font-mono text-xs text-ink/60">{cafe.deliveryRadius}km delivery</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}