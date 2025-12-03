/**
 * API Service for Authentication
 */

import { authAPI } from './api';

export const authService = {
  // Get current user profile
  getProfile: async () => {
    return await authAPI.getProfile();
  },

  // Update user profile
  updateProfile: async (data) => {
    return await authAPI.updateProfile(data);
  }
};
