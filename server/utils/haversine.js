/**
 * Calculates the Haversine distance between two points on the Earth's surface.
 * @param {number} lat1 - Latitude of point 1 in degrees.
 * @param {number} lon1 - Longitude of point 1 in degrees.
 * @param {number} lat2 - Latitude of point 2 in degrees.
 * @param {number} lon2 - Longitude of point 2 in degrees.
 * @returns {number} Distance in kilometers.
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371; // Earth's radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculates the delivery charge based on distance in kilometers.
 * @param {number} km - Distance in kilometers.
 * @returns {number} Delivery charge in INR.
 */
export const deliveryChargeFromDistance = (km) => {
    if (km <= 2) return 10;
    if (km <= 5) return 20;
    if (km <= 8) return 35;
    return 50;
};
