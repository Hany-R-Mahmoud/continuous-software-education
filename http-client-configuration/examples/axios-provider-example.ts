/**
 * Axios Provider Configuration Example
 * 
 * This example shows the complete axios provider setup with:
 * - Method wrapping for automatic data extraction
 * - Request and response interceptors
 * - Token management
 * - Error handling
 * - TypeScript type safety
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Step 1: Method Wrapper Function
const constructIntanceMethods = (
  instance: AxiosInstance,
  defaultErrorHandler: number
) => {
  return {
    get: async (url: string, config?: AxiosRequestConfig) => {
      const response = await instance.get(url, config);
      return response.data; // Automatic data extraction
    },

    post: async (url: string, data?: unknown, config?: AxiosRequestConfig) => {
      const response = await instance.post(url, data, config);
      return response.data;
    },

    put: async (url: string, data?: unknown, config?: AxiosRequestConfig) => {
      const response = await instance.put(url, data, config);
      return response.data;
    },

    patch: async (url: string, data?: unknown, config?: AxiosRequestConfig) => {
      const response = await instance.patch(url, data, config);
      return response.data;
    },

    delete: async (url: string, config?: AxiosRequestConfig) => {
      const response = await instance.delete(url, config);
      return response.data;
    },

    setErroHandler: (errorHandler: (args: unknown) => void) => {
      instance.interceptors.response.eject(defaultErrorHandler);
      instance.interceptors.response.use(
        (config) => config,
        (error) => {
          errorHandler(error);
          return Promise.reject(error);
        },
      );
    },
  };
};

// Step 2: TypeScript Type Definitions
type InstanceBase = ReturnType<typeof constructIntanceMethods>;
type InstanceWithTokenize = InstanceBase & { 
  tokenize: (token: string) => void 
};

// Step 3: Error Handler
export const handleErrorByStatus = (statusCode: number) => {
  let message = '';
  switch (statusCode) {
    case -1:
      message = 'Connection Timeout';
      break;
    case 0:
      message = 'Connection Error!';
      break;
    case 400:
      message = 'Bad Request. Please try again later.';
      break;
    case 401:
      message = 'Unauthorized Access, please login again.';
      break;
    case 403:
      message = 'Access Denied.';
      break;
    case 404:
      message = 'Resource Not Found.';
      break;
    case 500:
      message = 'Internal Server Error.';
      break;
    default:
      message = 'Something went wrong.';
      break;
  }
  return { message, statusCode };
};

// Step 4: Factory Function
function createAxiosInstance<T extends boolean>(
  useAuthToken?: T,
): T extends true ? InstanceWithTokenize : InstanceBase {
  // Create axios instance
  const instance = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(handleErrorByStatus(error?.response?.status || -1)),
  );

  // Response interceptor
  const defaultErrorHandler = instance.interceptors.response.use(
    (config) => config,
    (error) => Promise.reject(handleErrorByStatus(error?.response?.status || -1)),
  );

  // Wrap methods
  const axiosInstanceMethods = constructIntanceMethods(instance, defaultErrorHandler);

  // Add tokenize if needed
  if (useAuthToken) {
    return {
      ...axiosInstanceMethods,
      tokenize: (token: string) => {
        instance.defaults.headers.common.Authorization = `Bearer ${token}`;
      },
    } as T extends true ? InstanceWithTokenize : InstanceBase;
  }

  return axiosInstanceMethods as T extends true ? InstanceWithTokenize : InstanceBase;
}

// Step 5: Create Instances
export const publicInstance = createAxiosInstance(false);
export const authInstance = createAxiosInstance(true);

// Usage Examples:

// Example 1: Using publicInstance for login
async function loginExample(username: string, password: string) {
  const credentials = `${username}:${password}`;
  const basicAuth = 'Basic ' + btoa(credentials);
  
  const data = await publicInstance.get('/auth', {
    headers: { Authorization: basicAuth }
  });
  
  return data;
}

// Example 2: Using authInstance with token
async function protectedRequestExample() {
  // Set token once
  authInstance.tokenize('your-jwt-token-here');
  
  // All requests automatically include token
  const userData = await authInstance.get('/api/user');
  const posts = await authInstance.get('/api/posts');
  
  return { userData, posts };
}

// Example 3: Custom error handler
publicInstance.setErroHandler((error) => {
  console.error('Public API Error:', error);
  // Custom error handling logic
});

authInstance.setErroHandler((error) => {
  console.error('Auth API Error:', error);
  // Custom error handling logic (e.g., redirect to login)
});
