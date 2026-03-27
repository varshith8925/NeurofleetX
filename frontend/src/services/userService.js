// frontend/src/services/userService.js
import api from './api';

const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUsersByRole: async (role) => {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getDrivers: async () => {
    const response = await api.get('/users/drivers');
    return response.data;
  },

  getAvailableDrivers: async () => {
    const response = await api.get('/users/drivers/available');
    return response.data;
  },

  getManagers: async () => {
    const response = await api.get('/users/managers');
    return response.data;
  },

  getCustomers: async () => {
    const response = await api.get('/users/customers');
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

export default userService;