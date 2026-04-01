/**
 * Convert string address to coordinates using Nominatim API (OpenStreetMap)
 * @param {string} address - Full address string
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const geocodeAddress = async (address) => {
    try {
        if (!address) return null;

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    // Nominatim requires User-Agent
                    'User-Agent': 'Restroon-App/1.0'
                }
            }
        );

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (err) {
        console.error('Geocoding error:', err);
        return null;
    }
};

/**
 * Convert coordinates to address string
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{formatted_address: string, city: string, pincode: string} | null>}
 */
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    'User-Agent': 'Restroon-App/1.0'
                }
            }
        );

        const data = await response.json();

        if (data && !data.error) {
            return {
                formatted_address: data.display_name,
                city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || '',
                pincode: data.address?.postcode || ''
            };
        }
        return null;
    } catch (err) {
        console.error('Reverse geocoding error:', err);
        return null;
    }
};
