// src/pages/customer/CafesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import StaticMap from '../../components/common/StaticMap';
import { getUserLocation } from '../../utils/getUserLocation';
import { calculateDistance } from '../../utils/haversine';

export default function CafesPage() {
    const [cafes, setCafes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        getUserLocation()
            .then(loc => setUserLocation(loc))
            .catch(err => console.error("Location error:", err.message));
    }, []);

    useEffect(() => {
        setLoading(true);
        api.get(`/api/cafe?search=${search}`)
            .then(r => {
                let fetchedCafes = r.data.cafes;
                if (userLocation) {
                    fetchedCafes = fetchedCafes.filter(cafe => {
                        if (!cafe.location || !cafe.location.coordinates) return false;
                        const [lng, lat] = cafe.location.coordinates;
                        const distance = calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            lat,
                            lng
                        );
                        cafe.distance = distance; // temp save for rendering
                        return distance <= 5; // 5km radius
                    });
                    // Sort nearest first
                    fetchedCafes.sort((a, b) => a.distance - b.distance);
                }
                setCafes(fetchedCafes);
            })
            .finally(() => setLoading(false));
    }, [search, userLocation]);

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

                {/* View Toggle */}
                {!loading && cafes.length > 0 && (
                    <div className="flex justify-center mb-8">
                        <div className="bg-white border-3 border-ink rounded-xl p-1 inline-flex shadow-[4px_4px_0_#1A1A1A]">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-6 py-2 rounded-lg font-bangers tracking-wider transition-colors ${viewMode === 'list' ? 'bg-orange text-cream' : 'text-ink hover:bg-cream'}`}
                            >
                                LIST VIEW
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-6 py-2 rounded-lg font-bangers tracking-wider transition-colors ${viewMode === 'map' ? 'bg-orange text-cream' : 'text-ink hover:bg-cream'}`}
                            >
                                MAP VIEW
                            </button>
                        </div>
                    </div>
                )}

                {/* Grid vs Map */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-6xl animate-bounce">🛵</div>
                    </div>
                ) : cafes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">😔</div>
                        <p className="font-bangers text-3xl text-ink">No cafes found</p>
                    </div>
                ) : viewMode === 'map' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-[600px] w-full"
                    >
                        <StaticMap cafes={cafes} />
                    </motion.div>
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
                                    <div className="bg-cream border-3 border-ink rounded-2xl overflow-hidden shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-2 hover:shadow-[8px_8px_0_#1A1A1A] transition-all duration-200 cursor-pointer flex flex-col h-full">
                                        {/* Cover */}
                                        <div className="h-48 bg-gradient-to-br from-yellow to-orange flex items-center justify-center relative flex-shrink-0">
                                            {cafe.coverImage
                                                ? <img src={cafe.coverImage} alt={cafe.name} className="w-full h-full object-cover" />
                                                : <span className="text-7xl">🏪</span>
                                            }
                                            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full border-2 border-ink font-bangers text-sm ${cafe.isOpen ? 'bg-green-400' : 'bg-red text-cream'}`}>
                                                {cafe.isOpen ? '✅ OPEN' : '❌ CLOSED'}
                                            </div>
                                        </div>

                                        <div className="p-5 flex flex-col flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {cafe.logo
                                                    ? <img src={cafe.logo} className="w-10 h-10 rounded-full border-2 border-ink object-cover" alt="" />
                                                    : <div className="w-10 h-10 bg-yellow rounded-full border-2 border-ink flex flex-shrink-0 items-center justify-center">🍽️</div>
                                                }
                                                <div className="flex flex-col overflow-hidden min-w-0">
                                                    <h3 className="font-bangers text-xl text-ink truncate w-full" title={cafe.name}>{cafe.name}</h3>
                                                    <p className="font-mono text-xs text-ink/60 truncate w-full" title={cafe.address?.city}>{cafe.address?.city}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {cafe.cuisine?.slice(0, 3).map(c => (
                                                    <span key={c} className="bg-yellow/60 border border-ink rounded-full px-2 py-0.5 font-grotesk text-xs">{c}</span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-2">
                                                <div className="flex items-center gap-1">
                                                    <span>⭐</span>
                                                    <span className="font-grotesk text-sm font-semibold">{cafe.ratings?.average?.toFixed(1) || '4.5'}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="font-mono text-xs text-ink/60">{cafe.deliveryRadius}km delivery</span>
                                                    {cafe.distance !== undefined && (
                                                        <span className="font-mono text-xs text-orange font-bold mt-1">{cafe.distance.toFixed(1)} km away</span>
                                                    )}
                                                </div>
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