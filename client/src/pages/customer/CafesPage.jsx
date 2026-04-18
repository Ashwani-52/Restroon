// src/pages/customer/CafesPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import CafeCard from '../../components/ui/CafeCard';
import StaticMap from '../../components/common/StaticMap';
import { getUserLocation } from '../../utils/getUserLocation';
import { calculateDistance } from '../../utils/haversine';

// Skeleton Loader Component
const CafeSkeleton = () => (
    <div className="bg-cream border-3 border-ink rounded-2xl overflow-hidden shadow-[6px_6px_0_#1A1A1A] flex flex-col h-[400px] animate-pulse">
        <div className="h-48 bg-ink/10" />
        <div className="p-5 flex flex-col flex-1 gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ink/10" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-ink/10 rounded w-3/4" />
                    <div className="h-3 bg-ink/10 rounded w-1/2" />
                </div>
            </div>
            <div className="flex gap-2">
                <div className="h-6 w-16 bg-ink/10 rounded-full" />
                <div className="h-6 w-16 bg-ink/10 rounded-full" />
            </div>
            <div className="mt-auto flex justify-between items-center">
                <div className="h-4 w-12 bg-ink/10 rounded" />
                <div className="h-4 w-20 bg-ink/10 rounded" />
            </div>
        </div>
    </div>
);

export default function CafesPage() {
    const [cafes, setCafes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        getUserLocation()
            .then(loc => setUserLocation(loc))
            .catch(err => console.error("Location error:", err.message));
    }, []);

    useEffect(() => {
        setLoading(true);
        let url = `/api/cafe?search=${search}`;
        if (userLocation) {
            url = `/api/cafe/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radiusInKm=70`;
            if (search) url += `&search=${search}`;
        }

        api.get(url)
            .then(r => {
                let fetchedCafes = r.data.cafes;
                if (userLocation) {
                    fetchedCafes.forEach(cafe => {
                        if (!cafe.location || !cafe.location.coordinates) return;
                        const [lng, lat] = cafe.location.coordinates;
                        cafe.distance = calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            lat,
                            lng
                        );
                    });
                }
                setCafes(fetchedCafes);
            })
            .catch(err => console.error("Fetch cafes error:", err))
            .finally(() => {
                // Small delay to prevent flickering on fast connections
                setTimeout(() => setLoading(false), 300);
            });
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => <CafeSkeleton key={i} />)}
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
                            <CafeCard key={cafe._id} cafe={cafe} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}