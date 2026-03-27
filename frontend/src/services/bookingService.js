// frontend/src/services/bookingService.js
import api from './api';

const bookingService = {
  getAllBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  updateBookingStatus: async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  getPendingBookings: async () => {
    const response = await api.get('/bookings/pending');
    return response.data;
  },

  getDriverBookings: async () => {
    const response = await api.get('/bookings/driver');
    return response.data;
  },

  acceptBooking: async (id) => {
    const response = await api.put(`/bookings/${id}/accept`);
    return response.data;
  },

  startRide: async (id) => {
    const response = await api.put(`/bookings/${id}/start`);
    return response.data;
  },

  completeRide: async (id) => {
    const response = await api.put(`/bookings/${id}/complete`);
    return response.data;
  },

  getBookingStats: async () => {
    const response = await api.get('/bookings/stats');
    return response.data;
  },

  getCustomerStats: async () => {
    const response = await api.get('/bookings/customer/stats');
    return response.data;
  },

  getDriverEarnings: async () => {
    const response = await api.get('/bookings/driver/earnings');
    return response.data;
  }
};

export default bookingService;