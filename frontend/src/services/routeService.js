// frontend/src/services/routeService.js
import api from './api';
import axios from 'axios';

const AI_SERVICE_URL = 'http://localhost:5000';

const routeService = {
  optimizeRoute: async (routeData) => {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/routes/optimize`, routeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Route optimization failed' };
    }
  },

  getMultipleRoutes: async (source, destination) => {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/routes/multiple`, {
        source,
        destination
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get routes' };
    }
  },

  saveRoute: async (routeData) => {
    const response = await api.post('/routes', routeData);
    return response.data;
  },

  getRouteById: async (id) => {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  }
};

export default routeService;