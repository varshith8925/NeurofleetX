// frontend/src/services/routeService.js
// Uses OSRM public routing API directly — no local AI service required.
// Generates up to 3 route alternatives with real polylines for Leaflet.

import api from './api';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

// Decode Google-style encoded polyline (OSRM returns this format)
function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let b;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Route visual styles
const ROUTE_STYLES = [
  {
    name: 'Fastest Route',
    color: '#6366f1',
    description: 'Quickest path based on current conditions',
    recommended: true,
  },
  {
    name: 'Alternative Route',
    color: '#f59e0b',
    description: 'Alternative path avoiding main highways',
    recommended: false,
  },
  {
    name: 'Scenic Route',
    color: '#10b981',
    description: 'Longer but less congested route',
    recommended: false,
  },
];

// Simulate traffic labels
const TRAFFIC_LEVELS = ['Light', 'Moderate', 'Heavy'];

// Base fare per km (INR)
const FARE_PER_KM = 12;
const FARE_BASE = 40;

const routeService = {
  /**
   * Fetch up to 3 real route alternatives between two lat/lng points.
   * source / destination: { lat, lng }
   * Returns: { success, data: Route[] }
   */
  getMultipleRoutes: async (source, destination) => {
    try {
      const coords = `${source.lng},${source.lat};${destination.lng},${destination.lat}`;
      const url =
        `${OSRM_BASE}/${coords}` +
        `?overview=full&geometries=polyline&alternatives=true&steps=false`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OSRM returned ${response.status}`);
      }

      const json = await response.json();

      if (json.code !== 'Ok' || !json.routes || json.routes.length === 0) {
        throw new Error('No routes found from OSRM');
      }

      const routes = json.routes.slice(0, 3).map((osrmRoute, index) => {
        const style = ROUTE_STYLES[index] || ROUTE_STYLES[0];
        const distanceKm = parseFloat((osrmRoute.distance / 1000).toFixed(1));
        const durationMin = Math.round(osrmRoute.duration / 60);
        const polyline = decodePolyline(osrmRoute.geometry);

        // Random tolls for non-fastest routes
        const tolls = index === 0 ? 0 : Math.floor(Math.random() * 3) * 20;

        const fare = Math.round(FARE_BASE + distanceKm * FARE_PER_KM + tolls);

        // Assign traffic level (simulated; replace with real data if available)
        const traffic = TRAFFIC_LEVELS[Math.min(index, 2)];

        return {
          id: `route-${index}`,
          name: style.name,
          description: style.description,
          color: style.color,
          recommended: style.recommended,
          polyline,
          distance: distanceKm,
          duration: durationMin,
          fare,
          tolls,
          traffic,
        };
      });

      return { success: true, data: routes };
    } catch (error) {
      console.error('Route fetch failed:', error);
      // Fallback: return a straight-line "route" so the map still shows markers
      const fallbackPolyline = [
        [source.lat, source.lng],
        [destination.lat, destination.lng],
      ];
      const dist = parseFloat(
        (
          Math.sqrt(
            Math.pow(destination.lat - source.lat, 2) +
              Math.pow(destination.lng - source.lng, 2)
          ) * 111
        ).toFixed(1)
      );
      return {
        success: true,
        data: [
          {
            id: 'route-0',
            name: 'Direct Route',
            description: 'Straight-line estimate (live routing unavailable)',
            color: '#6366f1',
            recommended: true,
            polyline: fallbackPolyline,
            distance: dist,
            duration: Math.round((dist / 40) * 60),
            fare: Math.round(FARE_BASE + dist * FARE_PER_KM),
            tolls: 0,
            traffic: 'Unknown',
          },
        ],
      };
    }
  },

  // ── Backend-persisted routes (unchanged) ──────────────────────────────────

  optimizeRoute: async (routeData) => {
    const response = await api.post('/routes/optimize', routeData);
    return response.data;
  },

  saveRoute: async (routeData) => {
    const response = await api.post('/routes', routeData);
    return response.data;
  },

  getRouteById: async (id) => {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  },
};

export default routeService;