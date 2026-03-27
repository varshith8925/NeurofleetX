// frontend/src/services/authService.js
import api from './api';

const authService = {
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error);
      throw error.response?.data || { success: false, message: 'Signup failed' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  }
};

export default authService;