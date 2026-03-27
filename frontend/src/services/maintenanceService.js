// frontend/src/services/maintenanceService.js
import api from './api';

const maintenanceService = {
  getAllMaintenance: async () => {
    const response = await api.get('/maintenance');
    return response.data;
  },

  getMaintenanceById: async (id) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  createMaintenance: async (maintenanceData) => {
    const response = await api.post('/maintenance', maintenanceData);
    return response.data;
  },

  updateMaintenance: async (id, maintenanceData) => {
    const response = await api.put(`/maintenance/${id}`, maintenanceData);
    return response.data;
  },

  completeMaintenance: async (id) => {
    const response = await api.put(`/maintenance/${id}/complete`);
    return response.data;
  },

  getVehicleMaintenance: async (vehicleId) => {
    const response = await api.get(`/maintenance/vehicle/${vehicleId}`);
    return response.data;
  },

  getUpcomingMaintenance: async () => {
    const response = await api.get('/maintenance/upcoming');
    return response.data;
  },

  getOverdueMaintenance: async () => {
    const response = await api.get('/maintenance/overdue');
    return response.data;
  }
};

export default maintenanceService;