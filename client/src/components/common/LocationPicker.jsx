import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Create a custom icon using our app's style
const customIcon = new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="w-8 h-8 bg-yellow border-3 border-ink rounded-full flex items-center justify-center text-lg shadow-[2px_2px_0_#1A1A1A] transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform cursor-pointer">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

function MapEvents({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect({
                lat: e.latlng.lat,
                lng: e.latlng.lng
            });
        },
    });
    return null;
}

export default function LocationPicker({ 
    value = { lat: 20.5937, lng: 78.9629 }, // Default India
    onChange,
    className = "" 
}) {
    const defaultZoom = value.lat === 20.5937 ? 4 : 13;

    return (
        <div className={`rounded-xl border-3 border-ink overflow-hidden z-10 relative bg-cream ${className}`}>
            <MapContainer
                center={[value.lat, value.lng]}
                zoom={defaultZoom}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[value.lat, value.lng]} icon={customIcon} />
                <MapEvents onLocationSelect={onChange} />
            </MapContainer>
            
            <div className="absolute bottom-4 left-4 right-4 z-[400] pointer-events-none">
                <div className="bg-cream/90 backdrop-blur-sm border-2 border-ink rounded-lg p-2 text-center shadow-[2px_2px_0_#1A1A1A]">
                    <p className="font-bangers text-sm text-ink">Click map to set exact location</p>
                </div>
            </div>
        </div>
    );
}
