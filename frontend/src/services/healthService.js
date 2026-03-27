import api from './api';

const healthService = {
  getAllVehicleHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  getVehicleHealth: async (vehicleId) => {
    const response = await api.get(`/health/vehicle/${vehicleId}`);
    return response.data;
  },

  getFleetHealthMetrics: async () => {
    const response = await api.get('/health/metrics');
    return response.data;
  },

  analyzeVehicleHealth: async (vehicleId) => {
    const response = await api.post(`/health/analyze/${vehicleId}`);
    return response.data;
  },

  analyzeAllVehicles: async () => {
    const response = await api.post('/health/analyze-all');
    return response.data;
  }
};

export default healthService;