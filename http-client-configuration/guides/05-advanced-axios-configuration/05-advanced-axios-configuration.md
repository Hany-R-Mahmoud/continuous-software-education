# Module 5: Advanced Axios Configuration

> **Advanced patterns: interceptors, error handling, token management, and configuration options**

---

## Advanced Configuration Options

### `maxBodyLength: Infinity`

#### What It Does

Sets the maximum size of the request body that axios will accept. By default, axios has a limit (usually 10MB). Setting it to `Infinity` removes this limit.

#### When Is It Needed?

```typescript
// ✅ Needed for large payloads
const data = await apiClient.post('/upload', largeFile, {
  maxBodyLength: Infinity, // Allow large file uploads
});

// ❌ Not needed for GET requests (no body)
const data = await apiClient.get('/users', {
  maxBodyLength: Infinity, // Unnecessary - GET has no body
});
```

#### Common Use Cases

- **File uploads**: Large files (images, videos, documents)
- **Large JSON payloads**: Bulk data operations
- **Data exports**: Sending large datasets

#### Example

```typescript
// Upload large file
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return await apiClient.post('/upload', formData, {
    maxBodyLength: Infinity, // Required for large files
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
```

---

## Interceptors Deep Dive

### Request Interceptors

Interceptors that run **before** the request is sent.

#### Use Cases

- Add authentication tokens
- Log requests
- Modify request data
- Add custom headers

#### Example

```typescript
instance.interceptors.request.use(
  (config) => {
    // Add token to every request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request
    console.log('Request:', config.method, config.url);
    
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);
```

### Response Interceptors

Interceptors that run **after** the response is received.

#### Use Cases

- Handle errors globally
- Transform response data
- Refresh tokens automatically
- Log responses

#### Example

```typescript
instance.interceptors.response.use(
  (response) => {
    // Transform successful responses
    return response;
  },
  async (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Token expired - refresh it
      const newToken = await refreshToken();
      if (newToken) {
        // Retry original request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return instance.request(error.config);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## Custom Error Handlers

### Setting Custom Error Handlers

The axios provider includes a `setErroHandler` method to customize error handling:

```typescript
import { authInstance, publicInstance } from '@mdp-eg-org/aurora-modules';

export const customErrorHandler = async (error: any, isAuthInstance = false) => {
  const statusCode = error?.response?.status;
  const apiErrorData = error?.response?.data;

  let result;

  switch (statusCode) {
    case 401:
      if (isAuthInstance) {
        // Clear session and navigate to login
        await sessionStore.clearSession();
        router.replace(routes.login.path);
      }
      result = {
        ...(apiErrorData ? { data: apiErrorData } : {}),
      };
      break;

    default:
      result = {
        ...(apiErrorData ? { data: apiErrorData } : {}),
      };
      break;
  }

  return result;
};

// Configure error handlers on both instances
publicInstance.setErroHandler((error) => customErrorHandler(error, false));
authInstance.setErroHandler((error) => customErrorHandler(error, true));
```

### Error Handler Features

1. **Status code handling**: Different logic for different status codes
2. **Instance-specific logic**: Different behavior for public vs auth instances
3. **Navigation**: Redirect to login on 401
4. **Session management**: Clear session on authentication errors

---

## Token Management Patterns

### Pattern 1: Set Token After Login

```typescript
// Login
const loginData = await publicInstance.get('/auth', {
  headers: { Authorization: basicAuth }
});

// Set token for future requests
authInstance.tokenize(loginData.access_token);

// Now all requests include token automatically
const userData = await authInstance.get('/api/user');
```

### Pattern 2: Token Refresh on 401

```typescript
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const newToken = await refreshToken();
      if (newToken) {
        // Update token
        authInstance.tokenize(newToken);
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return instance.request(error.config);
      } else {
        // Refresh failed - redirect to login
        router.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);
```

### Pattern 3: Token from Secure Storage

```typescript
// Load token from secure storage on app start
useEffect(() => {
  const loadToken = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      authInstance.tokenize(token);
    }
  };
  loadToken();
}, []);

// Save token after login
const loginData = await publicInstance.get('/auth', {
  headers: { Authorization: basicAuth }
});

await SecureStore.setItemAsync('authToken', loginData.access_token);
authInstance.tokenize(loginData.access_token);
```

---

## Real-World Implementation

### Complete Auth Service

```typescript
import { publicInstance, authInstance } from '@mdp-eg-org/aurora-modules';
import { encode } from 'base-64';
import * as SecureStore from 'expo-secure-store';

export const authServices = {
  login: async (params: { username: string; password: string }) => {
    // Encode credentials as Basic Auth
    const credentials = `${params.username}:${params.password}`;
    const basicAuth = 'Basic ' + encode(credentials);

    // Use publicInstance for login
    const data = await publicInstance.get('/auth/login', {
      headers: {
        Authorization: basicAuth,
        clientId: '1234',
        'g-recaptcha-response': '100',
      },
    });

    // Save token securely
    await SecureStore.setItemAsync('authToken', data.access_token);
    
    // Set token for future requests
    authInstance.tokenize(data.access_token);

    return data;
  },

  logout: async () => {
    // Clear token from secure storage
    await SecureStore.deleteItemAsync('authToken');
    
    // Clear token from axios instance
    authInstance.tokenize('');
    
    return { success: true };
  },
};
```

### Session Provider Integration

```typescript
import { authInstance } from '@mdp-eg-org/aurora-modules';
import * as SecureStore from 'expo-secure-store';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const tokenValue = await SecureStore.getItemAsync('authToken');
      if (tokenValue) {
        setTokenState(tokenValue);
        authInstance.tokenize(tokenValue); // Set token in axios
      }
    };
    loadToken();
  }, []);

  const setToken = useCallback(async (tokenValue: string | null) => {
    setTokenState(tokenValue);
    authInstance.tokenize(tokenValue || ''); // Update axios token

    // Persist to secure storage
    if (tokenValue !== null) {
      await SecureStore.setItemAsync('authToken', tokenValue);
    } else {
      await SecureStore.deleteItemAsync('authToken');
    }
  }, []);

  // ... rest of provider
}
```

---

## Configuration Best Practices

### 1. Separate Public and Auth Instances

```typescript
// ✅ GOOD: Separate instances
const publicInstance = createAxiosInstance(false);  // Public APIs
const authInstance = createAxiosInstance(true);      // Protected APIs

// ❌ BAD: Using one instance for everything
const apiClient = createAxiosInstance(true);
```

### 2. Centralized Error Handling

```typescript
// ✅ GOOD: One error handler
publicInstance.setErroHandler(handleError);
authInstance.setErroHandler(handleError);

// ❌ BAD: Error handling in every API call
try {
  const data = await apiClient.get('/api');
} catch (error) {
  // Handle error here (repetitive)
}
```

### 3. Secure Token Storage

```typescript
// ✅ GOOD: Secure storage
await SecureStore.setItemAsync('authToken', token);

// ❌ BAD: Insecure storage
localStorage.setItem('authToken', token);
```

### 4. Token Refresh Strategy

```typescript
// ✅ GOOD: Automatic token refresh
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        authInstance.tokenize(newToken);
        return instance.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## Common Patterns

### Pattern 1: Request Logging

```typescript
instance.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});
```

### Pattern 2: Response Transformation

```typescript
instance.interceptors.response.use((response) => {
  // Transform response data
  return {
    ...response,
    data: {
      ...response.data,
      timestamp: new Date().toISOString(),
    },
  };
});
```

### Pattern 3: Retry on Failure

```typescript
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry up to 3 times
    if (!config._retry && error.response?.status >= 500) {
      config._retry = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return instance.request(config);
    }
    
    return Promise.reject(error);
  }
);
```

---

## Troubleshooting

### Issue: Token Not Being Sent

**Problem:**
```typescript
authInstance.tokenize('token');
const data = await authInstance.get('/api/user');
// Token not in request
```

**Solution:**
```typescript
// Make sure tokenize is called before making requests
authInstance.tokenize('token'); // Set first
const data = await authInstance.get('/api/user'); // Then use
```

### Issue: Errors Not Being Handled

**Problem:**
```typescript
// Errors not going through custom handler
```

**Solution:**
```typescript
// Make sure setErroHandler is called after instance creation
const instance = createAxiosInstance(true);
instance.setErroHandler(customErrorHandler);
```

### Issue: Large File Uploads Failing

**Problem:**
```typescript
// File upload fails with large files
```

**Solution:**
```typescript
// Add maxBodyLength for large uploads
await apiClient.post('/upload', formData, {
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});
```

---

## Summary

### Key Takeaways

1. **`maxBodyLength: Infinity`** - Needed for large file uploads, not for GET requests
2. **Interceptors** - Powerful tool for request/response transformation
3. **Custom error handlers** - Centralized error handling with `setErroHandler`
4. **Token management** - Use `tokenize()` to set tokens, store securely
5. **Best practices** - Separate instances, centralized error handling, secure storage

### Advanced Features

- **Request interceptors**: Modify requests before sending
- **Response interceptors**: Transform responses and handle errors
- **Token refresh**: Automatic token refresh on 401
- **Error handling**: Custom error handlers per instance
- **Retry logic**: Automatic retry on failure

### Next Steps

- Review the code examples in the `examples/` folder
- Implement these patterns in your own projects
- Experiment with different interceptor patterns
- Study real-world implementations

---

**The bottom line**: Advanced axios configuration provides powerful tools for handling complex scenarios like token refresh, error handling, and request transformation. Use these patterns to build robust, maintainable HTTP client setups.
