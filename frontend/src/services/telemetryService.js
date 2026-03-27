import api from './api';

const telemetryService = {
  getVehicleTelemetry: async (vehicleId) => {
    const response = await api.get(`/telemetry/vehicle/${vehicleId}`);
    return response.data;
  },

  getLatestTelemetry: async (vehicleId) => {
    const response = await api.get(`/telemetry/vehicle/${vehicleId}/latest`);
    return response.data;
  },

  getAllLatestTelemetry: async () => {
    const response = await api.get('/telemetry/latest');
    return response.data;
  },

  updateTelemetry: async (vehicleId, telemetryData) => {
    const response = await api.put(`/telemetry/vehicle/${vehicleId}/update`, telemetryData);
    return response.data;
  },

  getAlerts: async () => {
    const response = await api.get('/telemetry/alerts');
    return response.data;
  },

  acknowledgeAlert: async (alertId) => {
    const response = await api.put(`/telemetry/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  getOverspeedingVehicles: async () => {
    const response = await api.get('/telemetry/overspeeding');
    return response.data;
  }
};

export default telemetryService;