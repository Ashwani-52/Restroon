import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { userIcon, cafeIcon } from './leafletIcons';

const DeliveryMap = ({ deliveryLocation, cafeLocation }) => {
    // If we only have delivery loc, center there. Else if both, compute midpoint
    const center = deliveryLocation 
        ? [deliveryLocation.lat, deliveryLocation.lng] 
        : (cafeLocation ? [cafeLocation.lat, cafeLocation.lng] : [20.5937, 78.9629]);

    return (
        <div className="w-full h-[250px] rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0">
            <MapContainer
                center={center}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                />

                {/* Plot delivery destination */}
                {deliveryLocation?.lat && deliveryLocation?.lng && (
                    <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={userIcon}>
                        <Popup>Delivery Address</Popup>
                    </Marker>
                )}

                {/* Plot cafe location */}
                {cafeLocation?.lat && cafeLocation?.lng && (
                    <Marker position={[cafeLocation.lat, cafeLocation.lng]} icon={cafeIcon}>
                        <Popup>Cafe</Popup>
                    </Marker>
                )}

                {/* Draw line between them if both exist */}
                {deliveryLocation?.lat && cafeLocation?.lat && (
                    <Polyline 
                        positions={[
                            [cafeLocation.lat, cafeLocation.lng],
                            [deliveryLocation.lat, deliveryLocation.lng]
                        ]}
                        color="#EF4444"
                        weight={3}
                        dashArray="6, 6"
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default DeliveryMap;
