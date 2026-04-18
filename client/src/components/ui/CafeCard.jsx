import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CafeCard = React.memo(({ cafe, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link to={`/cafe/${cafe.slug}`}>
                <div className="bg-cream border-3 border-ink rounded-2xl overflow-hidden shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-2 hover:shadow-[8px_8px_0_#1A1A1A] transition-all duration-200 cursor-pointer flex flex-col h-full">
                    {/* Cover */}
                    <div className="h-48 bg-gradient-to-br from-yellow to-orange flex items-center justify-center relative flex-shrink-0">
                        {cafe.coverImage
                            ? <img 
                                src={cafe.coverImage} 
                                alt={cafe.name} 
                                className="w-full h-full object-cover" 
                                loading="lazy" 
                                decoding="async" 
                              />
                            : <span className="text-7xl">🏪</span>
                        }
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full border-2 border-ink font-bangers text-sm ${cafe.isOpen ? 'bg-green-400' : 'bg-red text-cream'}`}>
                            {cafe.isOpen ? '✅ OPEN' : '❌ CLOSED'}
                        </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            {cafe.logo
                                ? <img 
                                    src={cafe.logo} 
                                    className="w-10 h-10 rounded-full border-2 border-ink object-cover" 
                                    alt="" 
                                    loading="lazy" 
                                    decoding="async" 
                                  />
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
    );
});

CafeCard.displayName = 'CafeCard';

export default CafeCard;
