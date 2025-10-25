// src/services/authService.js
import { authAPI } from './apiService';

// Re-export auth functions with proper error handling
export async function signup({ username, fullName, password, confirmPassword }) {
  try {
    const result = await authAPI.signup({
      username,
      fullName,
      password,
      confirmPassword,
    });
    return result.data;
  } catch (error) {
    throw error;
  }
}

export async function login({ username, password }) {
  try {
    const result = await authAPI.login({
      username,
      password,
    });
    
    return result.data;
  } catch (error) {
    throw error;
  }
}

// Additional auth functions
export async function logout() {
  try {
    const result = await authAPI.logout();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getProfile() {
  try {
    const result = await authAPI.getProfile();
    return result.data;
  } catch (error) {
    throw error;
  }
}

export async function updateProfile(profileData) {
  try {
    const result = await authAPI.updateProfile(profileData);
    return result.data;
  } catch (error) {
    throw error;
  }
}
