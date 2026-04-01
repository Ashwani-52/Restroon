import { useState, useCallback } from 'react';

/**
 * Custom hook to encapsulate HTML5 Geolocation logic
 * Returns the current location coordinates and loading/error states
 */
export const useUserLocation = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getUserLocation = useCallback(() => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLoading(false);
            },
            (err) => {
                let errorMsg = 'Failed to get your location';
                
                switch (err.code) {
                    case 1:
                        errorMsg = 'Location access denied. Please allow location permissions in your browser.';
                        break;
                    case 2:
                        errorMsg = 'Location unavailable. Please check your connection or device settings.';
                        break;
                    case 3:
                        errorMsg = 'Location request timed out. Please try again.';
                        break;
                    default:
                        break;
                }

                setError(errorMsg);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, []);

    const clearLocation = useCallback(() => {
        setLocation(null);
    }, []);

    return {
        location,
        loading,
        error,
        getUserLocation,
        clearLocation,
        setLocation // Added setter for explicit map overrides
    };
};
