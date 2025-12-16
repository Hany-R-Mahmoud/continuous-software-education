/**
 * Custom Error Handler Example
 * 
 * This example shows how to implement custom error handling
 * for different axios instances (public vs authenticated).
 */

import { authInstance, publicInstance } from '@mdp-eg-org/aurora-modules';
import { router } from 'expo-router';
import { routes } from '@/routes';
import { sessionStore } from '@/hooks/use-session';

/**
 * API Error Response Type
 */
export type ApiErrorResponse = {
  data: {
    code: string;
    message: string;
    path: string;
    timestamp: string;
    errors?: string[];
  };
};

/**
 * Custom Error Handler
 * 
 * Handles errors differently based on:
 * - Status code (401, 403, 404, 500, etc.)
 * - Instance type (public vs authenticated)
 * - Error data from API
 */
export const customErrorHandler = async (
  error: any,
  isAuthInstance = false
) => {
  const statusCode = error?.response?.status;
  const apiErrorData = error?.response?.data;

  let result;

  switch (statusCode) {
    case 401:
      // Unauthorized - token expired or invalid
      if (isAuthInstance) {
        // For authenticated requests, clear session and redirect to login
        await sessionStore.clearSession();
        router.replace(routes.login.path);
      }
      result = {
        ...(apiErrorData ? { data: apiErrorData } : {}),
        message: 'Unauthorized. Please login again.',
      };
      break;

    case 403:
      // Forbidden - user doesn't have permission
      result = {
        ...(apiErrorData ? { data: apiErrorData } : {}),
        message: 'Access denied. You don\'t have permission.',
      };
      break;

    case 404:
      // Not found
      result = {
        ...(apiErrorData ? { data: apiErrorData } : {}),
        message: 'Resource not found.',
      };
      break;

    case 500:
      // Internal server error
      result = {
        ...(apiErrorData ? { data: apiErrorData } : {}),
        message: 'Server error. Please try again later.',
      };
      break;

    default:
      // Other errors
      result = {
        ...(apiErrorData ? { data: apiErrorData } : {}),
        message: apiErrorData?.message || 'Something went wrong.',
      };
      break;
  }

  return result;
};

/**
 * Configure Error Handlers
 * 
 * Set different error handlers for public and authenticated instances.
 * This allows different behavior for different types of requests.
 */
publicInstance.setErroHandler((error) => customErrorHandler(error, false));
authInstance.setErroHandler((error) => customErrorHandler(error, true));

/**
 * Usage Example
 */
async function errorHandlingExample() {
  try {
    // This will use the custom error handler
    const data = await authInstance.get('/api/user');
    return data;
  } catch (error) {
    // Error has already been processed by customErrorHandler
    // You can access the formatted error
    console.error('Formatted error:', error);
    
    // The error handler may have already:
    // - Redirected to login (if 401)
    // - Cleared session (if 401 on auth instance)
    // - Formatted the error message
    
    throw error;
  }
}

/**
 * Advanced Error Handler with Token Refresh
 * 
 * Example of an error handler that automatically refreshes tokens.
 */
export const advancedErrorHandler = async (
  error: any,
  isAuthInstance = false
) => {
  const statusCode = error?.response?.status;

  // Handle 401 with token refresh
  if (statusCode === 401 && isAuthInstance) {
    try {
      // Try to refresh token
      const refreshToken = await sessionStore.getRefreshToken();
      
      if (refreshToken) {
        // Refresh the token
        const newToken = await refreshAccessToken(refreshToken);
        
        if (newToken) {
          // Update token in axios instance
          authInstance.tokenize(newToken);
          
          // Retry the original request
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return authInstance.request(originalRequest);
        }
      }
    } catch (refreshError) {
      // Refresh failed - clear session and redirect
      await sessionStore.clearSession();
      router.replace(routes.login.path);
    }
  }

  // Handle other errors
  return customErrorHandler(error, isAuthInstance);
};

/**
 * Helper function to refresh access token
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await publicInstance.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    return response.access_token || null;
  } catch (error) {
    return null;
  }
}
