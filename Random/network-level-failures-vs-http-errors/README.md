# Network-Level Failures vs HTTP Errors

## Overview

Understanding the difference between network-level failures and HTTP errors is crucial for building robust applications. This distinction affects error handling, retry strategies, user experience, and debugging approaches.

**Key Takeaway**: Network failures occur **before** a response is received, while HTTP errors occur **after** the server processes the request and returns a response.

---

## Key Differences

### Network-Level Failures

**Definition**: Failures that occur **before** an HTTP response is received. The request never successfully reaches the server or a response never arrives.

**Characteristics**:
- ❌ No HTTP status code (often `0`, `-1`, or `undefined`)
- ❌ No response body
- ❌ Server was never reached
- ✅ Usually retriable (network conditions may improve)
- ✅ Client-side or infrastructure issues

**Common Causes**:
- No internet connection
- DNS resolution failure (`ENOTFOUND`, `EAI_AGAIN`)
- Connection timeout (`ECONNABORTED`, `ETIMEDOUT`)
- Network unreachable (`ENETUNREACH`)
- SSL/TLS handshake failure (`ECONNREFUSED`)
- Request aborted/cancelled (`ERR_CANCELED`)
- CORS preflight failure (browser-level)

**Axios Error Codes**:
```typescript
// Network-level failure indicators in Axios
error.code === 'ERR_NETWORK'        // General network error
error.code === 'ECONNABORTED'       // Request timeout
error.code === 'ETIMEDOUT'          // Connection timeout
error.code === 'ENOTFOUND'          // DNS lookup failed
error.code === 'ECONNREFUSED'       // Connection refused
error.response === undefined        // No response received
error.status === undefined          // No status code
```

### HTTP Errors

**Definition**: The request **successfully reached** the server, and the server returned an HTTP response with an error status code.

**Characteristics**:
- ✅ Has HTTP status code (`400-599`)
- ✅ Usually has response body with error details
- ✅ Server processed the request
- ⚠️ Retry strategy depends on status code
- ⚠️ May be client error (4xx) or server error (5xx)

**Status Code Categories**:

#### 4xx - Client Errors (Usually NOT retriable)
- `400 Bad Request` - Invalid request format/data
- `401 Unauthorized` - Authentication required/invalid
- `403 Forbidden` - Access denied (authenticated but not authorized)
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource conflict (e.g., duplicate entry)
- `422 Unprocessable Entity` - Validation errors

#### 5xx - Server Errors (Usually retriable)
- `500 Internal Server Error` - Generic server error
- `502 Bad Gateway` - Upstream server error
- `503 Service Unavailable` - Server temporarily unavailable
- `504 Gateway Timeout` - Upstream server timeout

**Axios Error Structure**:
```typescript
// HTTP error structure in Axios
error.response.status      // HTTP status code (400-599)
error.response.data        // Response body with error details
error.response.headers     // Response headers
error.response.statusText  // Status text (e.g., "Bad Request")
```

---

## Comparison Table

| Aspect | Network Failure | HTTP Error |
|--------|----------------|------------|
| **Status Code** | `0`, `-1`, or `undefined` | `400-599` |
| **Response Body** | None | Usually present |
| **Server Reached?** | No | Yes |
| **Retry Strategy** | Exponential backoff | Depends on status |
| **User Message** | "Check connection" | "Server error" or specific |
| **Monitoring** | Track connection issues | Track API errors |
| **Common Causes** | Client/infrastructure | Application logic |
| **Error Object** | `error.response === undefined` | `error.response.status` exists |

---

## Implementation Examples

### Basic Error Detection

```typescript
const isNetworkError = (error: any): boolean => {
  // No response means network failure
  if (!error.response) {
    return true;
  }
  
  // Status 0 typically indicates network failure
  if (error.response.status === 0) {
    return true;
  }
  
  // Check Axios error codes
  const networkErrorCodes = [
    'ERR_NETWORK',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ERR_CANCELED'
  ];
  
  return networkErrorCodes.includes(error.code);
};

const isHttpError = (error: any): boolean => {
  return error.response && error.response.status >= 400;
};
```

### Enhanced Error Handling

```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Determine error type
    const isNetwork = isNetworkError(error);
    const isHttp = isHttpError(error);
    
    if (isNetwork) {
      // Network failure handling
      return Promise.reject({
        type: 'network',
        message: 'Network connection failed. Please check your internet.',
        retryable: true,
        originalError: error
      });
    }
    
    if (isHttp) {
      // HTTP error handling
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      return Promise.reject({
        type: 'http',
        statusCode,
        message: errorData?.message || 'Server error occurred',
        retryable: statusCode >= 500, // Only 5xx are retryable
        originalError: error
      });
    }
    
    // Unknown error
    return Promise.reject({
      type: 'unknown',
      message: 'An unexpected error occurred',
      retryable: false,
      originalError: error
    });
  }
);
```

### Real-World Example: Current Implementation

Here's how a typical API client handles both error types:

```typescript
const handleErrorByStatus = async ({
  statusCode,
  message: apiError,
}: {
  statusCode: number;
  message: string | string[];
}) => {
  let message = '';
  const errorMessage = typeof apiError != 'string' ? apiError[0] : apiError;
  const errorStatusCode = statusCode || -1;
  
  switch (errorStatusCode) {
    // Network failures
    case -1:
      message = 'Connection Timeout';
      break;
    case 0:
      message = 'Connection Error!';
      break;
    
    // HTTP errors - Client errors (4xx)
    case 400:
      message = errorMessage ?? 'Bad Request. Please try again later.';
      break;
    case 401:
      message = errorMessage ?? 'Unauthorized Access, please login again';
      await authClient.signOut();
      break;
    case 403:
      message = errorMessage ?? 'Access Rejected';
      break;
    case 404:
      message = errorMessage ?? 'Not Found!';
      break;
    case 409:
      message = errorMessage ?? 'Conflict!';
      break;
    
    // HTTP errors - Server errors (5xx)
    case 500:
      message = errorMessage ?? 'An error occurred on our side, please try again later';
      break;
    
    default:
      message = 'Something went wrong, try again later.';
      break;
  }
  
  return { message, statusCode, success: false };
};
```

---

## Retry Strategies

### Differentiated Retry Logic

```typescript
// Network failures: Retry with exponential backoff
const shouldRetryNetworkError = (attempt: number): boolean => {
  return attempt < 3; // Retry up to 3 times
};

// HTTP errors: Only retry 5xx errors
const shouldRetryHttpError = (statusCode: number, attempt: number): boolean => {
  if (statusCode >= 500 && attempt < 2) {
    return true; // Retry server errors
  }
  if (statusCode === 429 && attempt < 3) {
    return true; // Retry rate limit errors
  }
  return false; // Don't retry client errors (4xx)
};
```

### React Query Example

```typescript
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: (failureCount, error) => {
    // Don't retry HTTP client errors (4xx)
    if (error.type === 'http' && error.statusCode < 500) {
      return false;
    }
    
    // Retry network errors and server errors (5xx)
    if (error.type === 'network' || 
        (error.type === 'http' && error.statusCode >= 500)) {
      return failureCount < 3;
    }
    
    return false;
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
});
```

---

## Best Practices

### 1. User-Facing Messages

**Network Failures**:
- "No internet connection"
- "Connection timeout. Please check your network."
- "Unable to reach server. Please try again."

**HTTP Errors**:
- `401`: "Please log in again"
- `403`: "You don't have permission to access this"
- `404`: "Resource not found"
- `500`: "Server error. Please try again later."

### 2. Error Logging

```typescript
// Log network errors for monitoring
if (isNetworkError(error)) {
  logger.warn('Network failure', {
    code: error.code,
    message: error.message,
    url: error.config?.url,
    timestamp: new Date().toISOString()
  });
}

// Log HTTP errors differently
if (isHttpError(error)) {
  logger.error('HTTP error', {
    status: error.response.status,
    url: error.config?.url,
    data: error.response.data,
    timestamp: new Date().toISOString()
  });
}
```

### 3. Error Boundaries

```typescript
// React Error Boundary example
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    // Differentiate handling based on error type
    if (error.type === 'network') {
      return { hasError: true, error: 'Network connection failed' };
    }
    if (error.type === 'http') {
      return { hasError: true, error: `Server error: ${error.statusCode}` };
    }
    return { hasError: true, error: 'An unexpected error occurred' };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## Common Pitfalls

### ❌ Don't Retry All Errors

```typescript
// BAD: Retrying 401 errors is pointless
retry: 3 // This will retry even 401/403 errors

// GOOD: Only retry appropriate errors
retry: (failureCount, error) => {
  if (error.statusCode >= 400 && error.statusCode < 500) {
    return false; // Don't retry client errors
  }
  return failureCount < 3;
}
```

### ❌ Don't Treat Network Errors as HTTP Errors

```typescript
// BAD: Assuming status code exists
const statusCode = error.response.status; // Crashes if no response

// GOOD: Check for response first
const statusCode = error.response?.status ?? 0;
```

### ❌ Generic Error Messages

```typescript
// BAD: Same message for all errors
message: 'Something went wrong'

// GOOD: Specific messages based on error type
message: isNetworkError(error) 
  ? 'Network connection failed'
  : `Server error: ${error.response.status}`
```

### ❌ Ignoring Error Codes

```typescript
// BAD: Only checking status code
if (error.response?.status === 0) {
  // This might be a network error, but could also be CORS
}

// GOOD: Check both status and error code
if (!error.response || error.code === 'ERR_NETWORK') {
  // Definitely a network error
}
```

---

## Testing

### Mock Network Failures

```typescript
// Simulate network failure
axios.get.mockRejectedValue({
  code: 'ERR_NETWORK',
  message: 'Network Error',
  response: undefined
});

// Simulate timeout
axios.get.mockRejectedValue({
  code: 'ECONNABORTED',
  message: 'timeout of 5000ms exceeded',
  response: undefined
});
```

### Mock HTTP Errors

```typescript
// Simulate HTTP error
axios.get.mockRejectedValue({
  response: {
    status: 404,
    statusText: 'Not Found',
    data: { message: 'Resource not found' }
  }
});

// Simulate server error
axios.get.mockRejectedValue({
  response: {
    status: 500,
    statusText: 'Internal Server Error',
    data: { message: 'Server error occurred' }
  }
});
```

### Test Error Handling

```typescript
describe('Error Handling', () => {
  it('should handle network errors', async () => {
    axios.get.mockRejectedValue({
      code: 'ERR_NETWORK',
      response: undefined
    });

    await expect(apiClient.get('/data')).rejects.toMatchObject({
      type: 'network',
      retryable: true
    });
  });

  it('should handle HTTP errors', async () => {
    axios.get.mockRejectedValue({
      response: {
        status: 404,
        data: { message: 'Not found' }
      }
    });

    await expect(apiClient.get('/data')).rejects.toMatchObject({
      type: 'http',
      statusCode: 404,
      retryable: false
    });
  });
});
```

---

## Debugging Tips

### 1. Check Error Structure

```typescript
console.log('Error type:', error.response ? 'HTTP' : 'Network');
console.log('Status code:', error.response?.status);
console.log('Error code:', error.code);
console.log('Error message:', error.message);
```

### 2. Network Tab Inspection

- **Network failures**: Request appears in red, no response received
- **HTTP errors**: Request shows status code (4xx/5xx), response body available

### 3. Common Scenarios

| Scenario | Error Type | Status Code | Error Code |
|----------|-----------|-------------|------------|
| No internet | Network | `undefined` | `ERR_NETWORK` |
| DNS failure | Network | `undefined` | `ENOTFOUND` |
| Timeout | Network | `undefined` | `ECONNABORTED` |
| CORS error | Network | `0` | `ERR_NETWORK` |
| 404 Not Found | HTTP | `404` | `undefined` |
| 500 Server Error | HTTP | `500` | `undefined` |

---

## Resources

### Documentation
- [Axios Error Handling](https://axios-http.com/docs/handling_errors)
- [MDN: HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [React Query: Error Handling](https://tanstack.com/query/latest/docs/react/guides/queries#error-handling)

### Related Topics
- Error Boundaries in React
- Retry Strategies and Exponential Backoff
- User Experience for Error States
- Monitoring and Logging Best Practices

---

## Summary

**Network-Level Failures**:
- Occur before server response
- No HTTP status code
- Usually retriable
- Client/infrastructure issues

**HTTP Errors**:
- Occur after server processes request
- Has HTTP status code (400-599)
- Retry depends on status code
- Application logic issues

**Key Actions**:
1. ✅ Always differentiate between error types
2. ✅ Use appropriate retry strategies
3. ✅ Provide specific user messages
4. ✅ Log errors appropriately for monitoring
5. ✅ Test both error types in your test suite

Understanding this distinction is fundamental to building resilient applications that handle errors gracefully and provide excellent user experiences.

---

**Last Updated**: 2025-01-27  
**Related Topics**: Error Handling, API Integration, Network Programming
