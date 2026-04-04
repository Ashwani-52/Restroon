import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon bug in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom draggable pin icon
const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// This component handles click on map to move pin
const MapClickHandler = ({ onLocationChange }) => {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// This component flies map to new center
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
    }
  }, [center]);
  return null;
};

const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const markerRef = useRef(null);

  // Default center — India
  const defaultCenter = [20.5937, 78.9629];

  const handleLocationChange = (lat, lng) => {
    setPosition([lat, lng]);
    onLocationSelect({ lat, lng, address });
    reverseGeocode(lat, lng);
  };

  // Reverse geocode — get address from coords
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const newAddress = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(newAddress);
      
      // We should also pass it to parents if we have it
      onLocationSelect({ lat, lng, address: newAddress });
    } catch {
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(fallback);
      onLocationSelect({ lat, lng, address: fallback });
    }
  };

  // Search address → get coordinates
  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=in`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        handleLocationChange(lat, lng);
      } else {
        alert('Address not found. Try a more specific address.');
      }
    } catch {
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Use device GPS
  const useMyLocation = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLocationChange(pos.coords.latitude, pos.coords.longitude);
        setGpsLoading(false);
      },
      (err) => {
        alert('Location access denied. Please enter address manually.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ width: '100%' }}>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchAddress()}
          placeholder="Search cafe address..."
          style={{
            flex: 1, padding: '10px 14px',
            borderRadius: 10, border: '2px solid #e5e7eb',
            fontSize: 14, outline: 'none'
          }}
        />
        <button
          type="button"
          onClick={searchAddress}
          disabled={searching}
          style={{
            padding: '10px 16px', background: '#FFD700',
            border: 'none', borderRadius: 10,
            fontWeight: 800, cursor: 'pointer', fontSize: 14
          }}
        >
          {searching ? '...' : '🔍'}
        </button>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={gpsLoading}
          style={{
            padding: '10px 16px', background: '#111',
            border: 'none', borderRadius: 10,
            color: '#FFD700', fontWeight: 800,
            cursor: 'pointer', fontSize: 14
          }}
        >
          {gpsLoading ? '...' : '📍'}
        </button>
      </div>

      {/* Map */}
      <div style={{
        borderRadius: 14, overflow: 'hidden',
        border: '2px solid #e5e7eb',
        height: 320
      }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 16 : 5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Move map to new position */}
          {position && <MapController center={position} />}

          {/* Click anywhere to move pin */}
          <MapClickHandler onLocationChange={handleLocationChange} />

          {/* DRAGGABLE MARKER — this is the key fix */}
          {position && (
            <Marker
              position={position}
              icon={pinIcon}
              draggable={true}          // ✅ KEY: must be true
              ref={markerRef}
              eventHandlers={{
                dragend(e) {            // ✅ KEY: update coords on drag end
                  const marker = markerRef.current;
                  if (marker) {
                    const { lat, lng } = marker.getLatLng();
                    handleLocationChange(lat, lng);
                  }
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: 8, padding: '8px 12px',
        background: '#fffbeb', borderRadius: 8,
        border: '1px solid #fde68a', fontSize: 12, color: '#92400e'
      }}>
        📌 <strong>3 ways to pin:</strong> Search address above · Click anywhere on map · Drag the pin to exact spot
      </div>

      {/* Selected address display */}
      {address && (
        <div style={{
          marginTop: 8, padding: '10px 14px',
          background: '#f0fdf4', borderRadius: 10,
          border: '1px solid #86efac', fontSize: 13
        }}>
          <strong style={{ color: '#16a34a' }}>✅ Selected:</strong>{' '}
          <span style={{ color: '#555' }}>{address}</span>
        </div>
      )}

      {/* Coords display (store these in DB) */}
      {position && (
        <div style={{
          marginTop: 6, fontSize: 11,
          color: '#aaa', fontFamily: 'monospace', textAlign: 'right'
        }}>
          {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
