import api from './api';

const geocodingService = {
  searchLocation: async (query) => {
    const response = await api.get(`/geocoding/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  getCoordinates: async (location) => {
    const response = await api.get(`/geocoding/coordinates?location=${encodeURIComponent(location)}`);
    return response.data;
  }
};

export default geocodingService;