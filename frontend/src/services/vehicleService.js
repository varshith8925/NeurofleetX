// frontend/src/services/vehicleService.js
import api from './api';

const vehicleService = {
  getAllVehicles: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  getVehicleById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  createVehicle: async (vehicleData) => {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  updateVehicle: async (id, vehicleData) => {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  getAvailableVehicles: async () => {
    const response = await api.get('/vehicles/available');
    return response.data;
  },

  getVehiclesByStatus: async (status) => {
    const response = await api.get(`/vehicles/status/${status}`);
    return response.data;
  },

  assignDriver: async (vehicleId, driverId) => {
    const response = await api.put(`/vehicles/${vehicleId}/assign/${driverId}`);
    return response.data;
  },

  unassignDriver: async (vehicleId) => {
    const response = await api.put(`/vehicles/${vehicleId}/unassign`);
    return response.data;
  },

  getVehicleStats: async () => {
    const response = await api.get('/vehicles/stats');
    return response.data;
  }
};

export default vehicleService;