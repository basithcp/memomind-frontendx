// User Management API - Now integrated with backend
import { authAPI } from '../services/apiService';

export const userAPI = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const result = await authAPI.getProfile();
      return result.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const result = await authAPI.updateProfile(profileData);
      return result.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const result = await authAPI.logout();
      return result;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
}
