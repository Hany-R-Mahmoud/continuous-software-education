# Module 4: Axios Provider Configuration

> **Step-by-step guide to understanding and implementing axios provider configuration**

---

## Overview

This module explains how to create a configured axios instance that provides:
- Automatic data extraction (`response.data`)
- Centralized error handling
- Token management
- Type-safe methods

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FILE EXECUTION FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. Define helper function (constructIntanceMethods)
   └─> Wraps axios methods to return data directly

2. Define types (InstanceBase, InstanceWithTokenize)
   └─> TypeScript type safety

3. Define factory function (createAxiosInstance)
   └─> Creates configured axios instance
       ├─> Creates axios instance
       ├─> Adds interceptors (request/response)
       ├─> Wraps methods
       └─> Optionally adds tokenize method

4. Create instances
   ├─> publicInstance = createAxiosInstance(false)
   └─> authInstance = createAxiosInstance(true)

5. Define error handler (handleErrorByStatus)
   └─> Converts status codes to messages

6. Export
   ├─> publicInstance
   ├─> authInstance
   └─> handleErrorByStatus
```

---

## Step 1: Method Wrapper Function

### Purpose

Wraps axios methods to automatically extract `response.data` instead of returning the full response object.

### Implementation

```typescript
const constructIntanceMethods = (
  instance: AxiosInstance,
  defaultErrorHandler: number
) => {
  return {
    get: async (url: string, config?: AxiosRequestConfig) => {
      const response = await instance.get(url, config);
      return response.data; // ✅ Extract data automatically
    },

    post: async (url: string, data?: unknown, config?: AxiosRequestConfig) => {
      const response = await instance.post(url, data, config);
      return response.data; // ✅ Extract data automatically
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
```

### Benefits

**Without wrapper:**
```typescript
const response = await axios.get('/api/users');
const data = response.data; // Manual extraction
```

**With wrapper:**
```typescript
const data = await apiClient.get('/api/users'); // Data already extracted!
```

---

## Step 2: TypeScript Type Definitions

### Purpose

Define TypeScript types for type safety and better developer experience.

### Implementation

```typescript
type InstanceBase = ReturnType<typeof constructIntanceMethods>;
// Result: { get, post, put, patch, delete, setErroHandler }

type InstanceWithTokenize = InstanceBase & { 
  tokenize: (token: string) => void 
};
// Result: InstanceBase + { tokenize }
```

### Why This Matters

```typescript
// TypeScript knows what methods are available
const publicInstance: InstanceBase = createAxiosInstance(false);
publicInstance.get('/api'); // ✅ TypeScript knows this exists
publicInstance.tokenize(); // ❌ TypeScript error - doesn't exist

const authInstance: InstanceWithTokenize = createAxiosInstance(true);
authInstance.get('/api'); // ✅ TypeScript knows this exists
authInstance.tokenize('token'); // ✅ TypeScript knows this exists
```

---

## Step 3: Factory Function

### Purpose

Creates a configured axios instance with interceptors and optional token support.

### Implementation

```typescript
function createAxiosInstance<T extends boolean>(
  useAuthToken?: T,
): T extends true ? InstanceWithTokenize : InstanceBase {
  // Step 1: Create axios instance
  const instance = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Step 2: Add request interceptor
  instance.interceptors.request.use(
    (config) => config, // Pass through requests
    (error) => Promise.reject(handleErrorByStatus(error?.response?.status || -1)),
  );

  // Step 3: Add response interceptor
  const defaultErrorHandler = instance.interceptors.response.use(
    (config) => config, // Pass through successful responses
    (error) => Promise.reject(handleErrorByStatus(error?.response?.status || -1)),
  );

  // Step 4: Wrap methods
  const axiosInstanceMethods = constructIntanceMethods(instance, defaultErrorHandler);

  // Step 5: Add tokenize if needed
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
```

### Step-by-Step Breakdown

#### Step 1: Create Axios Instance

```typescript
const instance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**What this does:**
- Creates a new axios instance
- Sets default headers (all requests will have `Content-Type: application/json`)

#### Step 2: Request Interceptor

```typescript
instance.interceptors.request.use(
  (config) => config, // Pass through
  (error) => Promise.reject(handleErrorByStatus(...)),
);
```

**What this does:**
- Runs before every request
- Can modify request config
- Handles request errors

#### Step 3: Response Interceptor

```typescript
const defaultErrorHandler = instance.interceptors.response.use(
  (config) => config, // Pass through success
  (error) => Promise.reject(handleErrorByStatus(...)),
);
```

**What this does:**
- Runs after every response
- Handles errors consistently
- Stores handler ID for later removal

#### Step 4: Wrap Methods

```typescript
const axiosInstanceMethods = constructIntanceMethods(instance, defaultErrorHandler);
```

**What this does:**
- Wraps axios methods to return `data` directly
- Adds `setErroHandler` method

#### Step 5: Add Tokenize (Conditional)

```typescript
if (useAuthToken) {
  return {
    ...axiosInstanceMethods,
    tokenize: (token: string) => {
      instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    },
  };
}
```

**What this does:**
- Adds `tokenize()` method to set auth token
- Token is automatically included in all future requests

---

## Step 4: Create Instances

### Implementation

```typescript
const publicInstance = createAxiosInstance(false);  // No token support
const authInstance = createAxiosInstance(true);      // Has tokenize method
```

### Differences

| Feature | `publicInstance` | `authInstance` |
|---------|------------------|----------------|
| Methods | get, post, put, patch, delete | get, post, put, patch, delete |
| Token support | ❌ No | ✅ Yes (has `tokenize`) |
| Use case | Login, public APIs | Protected APIs |

### Usage Examples

#### Using `publicInstance` (Login)

```typescript
import { publicInstance } from '@mdp-eg-org/aurora-modules';

// Login - no token needed
const data = await publicInstance.get('/auth', {
  headers: { Authorization: 'Basic ...' }
});
// data is already the response.data, not the full response!
```

#### Using `authInstance` (Protected Routes)

```typescript
import { authInstance } from '@mdp-eg-org/aurora-modules';

// After login, set the token
authInstance.tokenize('your-jwt-token-here');

// Now all requests automatically include:
// Authorization: Bearer your-jwt-token-here
const userData = await authInstance.get('/api/user');
const posts = await authInstance.get('/api/posts');
```

---

## Step 5: Error Handler

### Purpose

Converts HTTP status codes into user-friendly error messages.

### Implementation

```typescript
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
```

### Usage

```typescript
// Automatically called by interceptors
try {
  await apiClient.get('/api/data');
} catch (error) {
  // error.message = "Unauthorized Access, please login again."
  // error.statusCode = 401
}
```

---

## Complete Flow Example

### Real-World Usage

```typescript
// 1. Login with publicInstance
import { publicInstance, authInstance } from '@mdp-eg-org/aurora-modules';

async function login(username: string, password: string) {
  const credentials = `${username}:${password}`;
  const basicAuth = 'Basic ' + encode(credentials);
  
  // Use publicInstance (no token needed)
  const data = await publicInstance.get('/auth', {
    headers: { Authorization: basicAuth }
  });
  
  // 2. Set token for future requests
  authInstance.tokenize(data.access_token);
  
  return data;
}

// 3. Use authInstance for protected routes
async function getUserData() {
  // Token automatically included!
  const data = await authInstance.get('/api/user');
  return data;
}

async function getPosts() {
  // Token automatically included!
  const data = await authInstance.get('/api/posts');
  return data;
}
```

---

## Key Benefits

### 1. Automatic Data Extraction

```typescript
// Without wrapper
const response = await axios.get('/api/users');
const users = response.data;

// With wrapper
const users = await apiClient.get('/api/users');
```

### 2. Centralized Error Handling

```typescript
// All errors go through handleErrorByStatus
// Consistent error messages across the app
```

### 3. Token Management

```typescript
// Set once
authInstance.tokenize('token');

// Used everywhere automatically
await authInstance.get('/api/user');
await authInstance.get('/api/posts');
```

### 4. Type Safety

```typescript
// TypeScript knows available methods
const data = await publicInstance.get('/api/users');
// TypeScript infers return type
```

### 5. Separation of Concerns

```typescript
// Public APIs
publicInstance.get('/auth');

// Protected APIs
authInstance.get('/api/user');
```

---

## Summary

### Key Takeaways

1. **Method wrapper extracts `response.data` automatically** - No need for manual extraction
2. **Interceptors handle errors consistently** - All errors go through `handleErrorByStatus`
3. **Two instances for different use cases** - `publicInstance` for public APIs, `authInstance` for protected APIs
4. **Token management via `tokenize()`** - Set token once, used everywhere
5. **TypeScript types ensure correct usage** - Type safety prevents errors

### Architecture Benefits

- **DRY Principle**: Configure once, use everywhere
- **Separation**: Public vs authenticated instances
- **Consistency**: All requests follow same patterns
- **Maintainability**: Change behavior in one place
- **Type Safety**: TypeScript prevents errors

### Next Steps

- Read **[Module 5: Advanced Axios Configuration](../05-advanced-axios-configuration/05-advanced-axios-configuration.md)** for advanced patterns
- Review the code examples in the `examples/` folder
- Implement this pattern in your own projects

---

**The bottom line**: This axios provider configuration creates a clean, type-safe, and maintainable way to handle HTTP requests. It eliminates boilerplate code and provides consistent error handling and token management.
