export const geocodeAddress = async (addressParts) => {
  // Filter out empty parts and join with comma
  const query = addressParts.filter(Boolean).join(", ");

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "RestroonApp/1.0",
        },
      }
    );

    const data = await response.json();

    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

  } catch (error) {
    console.error("Geocode error:", error);
    return null;
  }
};
