import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { pickerIcon } from './leafletIcons';
import { reverseGeocode } from '../../utils/geocode';

// Map Event component handling clicks to set location
const MapEvents = ({ setPosition, setAddressData, onLocationSelect }) => {
    useMapEvents({
        async click(e) {
            const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
            setPosition(newPos);
            
            // Try to reverse geocode automatically
            const addressInfo = await reverseGeocode(newPos.lat, newPos.lng);
            if (addressInfo) {
                setAddressData(addressInfo);
                if (onLocationSelect) {
                    onLocationSelect(newPos, addressInfo);
                }
            } else {
                if (onLocationSelect) {
                    onLocationSelect(newPos, null);
                }
            }
        }
    });
    return null;
};

const LocationPicker = ({ defaultLocation, onLocationSelect }) => {
    // Default fallback to center of India if no loc passed
    const mapCenter = defaultLocation?.lat && defaultLocation?.lng 
        ? [defaultLocation.lat, defaultLocation.lng]
        : [20.5937, 78.9629];
        
    const [position, setPosition] = useState(
        defaultLocation?.lat && defaultLocation?.lng ? defaultLocation : null
    );
    const [addressData, setAddressData] = useState(null);

    return (
        <div className="w-full relative rounded-lg overflow-hidden border">
            <MapContainer
                center={mapCenter}
                zoom={defaultLocation?.lat ? 13 : 4}
                style={{ height: '300px', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapEvents 
                    setPosition={setPosition} 
                    setAddressData={setAddressData} 
                    onLocationSelect={onLocationSelect} 
                />

                {position && (
                    <Marker position={[position.lat, position.lng]} icon={pickerIcon} />
                )}
            </MapContainer>

            {/* Float a small hint box over the map if user hasn't clicked yet */}
            {!position && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow z-[400] pointer-events-none">
                    Click anywhere on the map to drop a pin
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
