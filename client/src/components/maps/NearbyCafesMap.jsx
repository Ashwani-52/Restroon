import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { userIcon, cafeIcon } from './leafletIcons';
import { useNavigate } from 'react-router-dom';

const NearbyCafesMap = ({ userLocation, cafes }) => {
    const navigate = useNavigate();

    // Default map center (if no user location)
    const center = userLocation ? [userLocation.lat, userLocation.lng] : [20.5937, 78.9629];
    const zoom = userLocation ? 13 : 4;

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Plot user marker if we have their location */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup>
                            <span className="font-semibold text-gray-800">You are here</span>
                        </Popup>
                    </Marker>
                )}

                {/* Plot all cafes */}
                {cafes?.map(cafe => {
                    const lat = cafe.location?.coordinates?.[1];
                    const lng = cafe.location?.coordinates?.[0];
                    
                    if (!lat || !lng) return null;

                    return (
                        <Marker 
                            key={cafe._id} 
                            position={[lat, lng]} 
                            icon={cafeIcon}
                        >
                            <Popup>
                                <div className="text-center min-w-[120px]">
                                    <h3 className="font-bold text-gray-900 mb-1">{cafe.name}</h3>
                                    <p className="text-xs text-gray-600 mb-2">{cafe.address.street}, {cafe.address.city}</p>
                                    <button 
                                        onClick={() => navigate(`/cafe/${cafe.slug}`)}
                                        className="bg-primary text-white text-xs px-3 py-1.5 rounded-full hover:bg-primary/90 transition-colors w-full"
                                    >
                                        View Menu
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default NearbyCafesMap;
