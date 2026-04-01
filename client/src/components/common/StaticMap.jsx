import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css'; // BUG 1 FIXED: Leaflet CSS imported

const customIcon = new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="w-8 h-8 bg-orange border-3 border-ink rounded-full flex items-center justify-center text-lg shadow-[2px_2px_0_#1A1A1A] transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform">🏪</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

export default function StaticMap({ cafes, className = "" }) {
    // If no cafes or missing coordinates, center on India
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = cafes?.length > 0 ? 5 : 4;

    return (
        // BUG 2 FIXED: Added h-full w-full so MapContainer height:100% works relative to parent
        <div className={`rounded-2xl border-3 border-ink overflow-hidden z-10 relative bg-cream shadow-[6px_6px_0_#1A1A1A] h-full w-full ${className}`}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {cafes?.map(cafe => {
                    if (!cafe.address?.coordinates?.lat || !cafe.address?.coordinates?.lng) return null;
                    
                    return (
                        <Marker 
                            key={cafe._id}
                            position={[cafe.address.coordinates.lat, cafe.address.coordinates.lng]} 
                            icon={customIcon}
                        >
                            <Popup className="custom-popup">
                                <div className="text-center p-1">
                                    <h4 className="font-bangers text-xl mb-1">{cafe.name}</h4>
                                    <p className="font-mono text-xs text-ink/60 mb-2">{cafe.cuisine?.slice(0, 2).join(', ')}</p>
                                    <div className="flex justify-center items-center gap-1 mb-3">
                                        <span className="text-sm">⭐</span>
                                        <span className="font-bold">{cafe.ratings?.average?.toFixed(1) || '4.5'}</span>
                                    </div>
                                    <Link 
                                        to={`/cafe/${cafe.slug}`}
                                        className="inline-block bg-yellow border-2 border-ink rounded-lg px-4 py-1.5 font-bangers text-sm shadow-[2px_2px_0_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                                    >
                                        Order Now
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
