/**
 * React Native API Client with Token Management
 * 
 * This example shows how to create an Axios client with
 * automatic token injection and refresh handling.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from './secure-storage';
import { router } from 'expo-router'; // or your navigation library

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Add token to every request
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get token from secure storage
    const token = await getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle token expiration and refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    // If request succeeds, just return the response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get refresh token
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Try to refresh
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Store new tokens
        await storeTokens(accessToken, newRefreshToken);
        
        // Update original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        await clearTokens();
        
        // Navigate to login (adjust based on your navigation library)
        if (router) {
          router.replace('/login');
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Usage example:
 * 
 * import apiClient from '@/lib/api-client';
 * 
 * // Make authenticated request
 * const response = await apiClient.get('/api/user/profile');
 * 
 * // Token is automatically added and refreshed if needed
 */

