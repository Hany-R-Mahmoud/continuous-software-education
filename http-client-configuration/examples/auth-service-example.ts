/**
 * Authentication Service Example
 * 
 * This example shows how to use the axios provider
 * for authentication in a real-world application.
 */

import { publicInstance, authInstance } from '@mdp-eg-org/aurora-modules';
import { encode } from 'base-64';
import * as SecureStore from 'expo-secure-store';

// Types
interface LoginParams {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

interface User {
  id: string;
  username: string;
  email: string;
}

/**
 * Authentication Service
 * 
 * Handles login, logout, and token management
 */
export const authServices = {
  /**
   * Login with Basic Authentication
   * 
   * Uses publicInstance since we don't have a token yet.
   * After successful login, sets the token for future requests.
   */
  login: async (params: LoginParams): Promise<LoginResponse> => {
    // Step 1: Encode credentials as Basic Auth
    const credentials = `${params.username}:${params.password}`;
    const basicAuth = 'Basic ' + encode(credentials);

    // Step 2: Use publicInstance for login (no token needed)
    const data = await publicInstance.get<LoginResponse>('/auth/login', {
      headers: {
        Authorization: basicAuth,
        clientId: '1234',
        'g-recaptcha-response': '100',
      },
    });

    // Step 3: Save token securely
    if (data.access_token) {
      await SecureStore.setItemAsync('authToken', data.access_token);
      
      // Step 4: Set token for future requests
      authInstance.tokenize(data.access_token);
    }

    // Step 5: Save refresh token if provided
    if (data.refresh_token) {
      await SecureStore.setItemAsync('refreshToken', data.refresh_token);
    }

    return data;
  },

  /**
   * Logout
   * 
   * Clears tokens from storage and axios instance.
   */
  logout: async (): Promise<void> => {
    // Clear tokens from secure storage
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('refreshToken');
    
    // Clear token from axios instance
    authInstance.tokenize('');
  },

  /**
   * Get Current User
   * 
   * Uses authInstance which automatically includes the token.
   */
  getCurrentUser: async (): Promise<User> => {
    const user = await authInstance.get<User>('/api/user');
    return user;
  },

  /**
   * Refresh Token
   * 
   * Uses refresh token to get a new access token.
   */
  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await publicInstance.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    // Update tokens
    if (data.access_token) {
      await SecureStore.setItemAsync('authToken', data.access_token);
      authInstance.tokenize(data.access_token);
    }

    return data;
  },
};

/**
 * Usage Example
 */
async function usageExample() {
  try {
    // Login
    const loginData = await authServices.login({
      username: 'user@example.com',
      password: 'password123',
    });
    
    console.log('Login successful:', loginData.access_token);

    // Get user data (token automatically included)
    const user = await authServices.getCurrentUser();
    console.log('Current user:', user);

    // Logout
    await authServices.logout();
    console.log('Logged out successfully');

  } catch (error) {
    console.error('Auth error:', error);
  }
}

/**
 * Session Initialization
 * 
 * Load token from storage on app start.
 */
export async function initializeSession(): Promise<void> {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    
    if (token) {
      // Set token for future requests
      authInstance.tokenize(token);
      console.log('Session initialized with existing token');
    } else {
      console.log('No existing session found');
    }
  } catch (error) {
    console.error('Error initializing session:', error);
  }
}
