// frontend/src/services/geocodingService.js
// Uses OpenStreetMap Nominatim API directly (no backend required)

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

const geocodingService = {
  /**
   * Search for locations by name using Nominatim
   * Returns array of { lat, lon, display_name, place_id, type, ... }
   */
  searchLocation: async (query) => {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '8',
        countrycodes: 'in', // Bias results to India — remove if global search needed
      });

      const response = await fetch(
        `${NOMINATIM_BASE}/search?${params.toString()}`,
        {
          headers: {
            // Nominatim requires a descriptive User-Agent
            'Accept-Language': 'en',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.map((item) => ({
          lat: item.lat,
          lon: item.lon,
          display_name: item.display_name,
          place_id: item.place_id,
          type: item.type,
          importance: item.importance,
        })),
      };
    } catch (error) {
      console.error('Location search failed:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * Reverse geocode: coordinates → address string
   */
  getAddressFromCoords: async (lat, lng) => {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json',
      });

      const response = await fetch(
        `${NOMINATIM_BASE}/reverse?${params.toString()}`
      );

      if (!response.ok) throw new Error(`Nominatim reverse error: ${response.status}`);

      const data = await response.json();
      return { success: true, data: data.display_name };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return { success: false, data: null };
    }
  },

  /**
   * Legacy compatibility shim — calls searchLocation internally
   */
  getCoordinates: async (location) => {
    const result = await geocodingService.searchLocation(location);
    if (result.success && result.data.length > 0) {
      const first = result.data[0];
      return {
        success: true,
        data: { lat: parseFloat(first.lat), lng: parseFloat(first.lon), name: first.display_name },
      };
    }
    return { success: false, data: null };
  },
};

export default geocodingService;