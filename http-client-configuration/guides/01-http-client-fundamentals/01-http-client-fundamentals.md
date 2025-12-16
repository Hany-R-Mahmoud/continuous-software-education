# Module 1: HTTP Client Fundamentals

> **Understanding why HTTP client configuration is essential and when to implement it**

---

## What is an HTTP Client?

An **HTTP client** is a tool your application uses to communicate with servers (APIs). It handles sending HTTP requests and receiving HTTP responses.

```
Your App  ──HTTP Request──>  Server
         <──HTTP Response──
```

### Common HTTP Clients

- **Native `fetch`**: Built into browsers and Node.js
- **Axios**: Popular third-party library
- **Custom `apiClient`**: Wrapper around fetch or axios
- **Other libraries**: `node-fetch`, `ky`, `got`, etc.

---

## The Problem: Why Not Just Use `fetch`?

### Without Configuration (Repetitive and Error-Prone)

```typescript
// ❌ Without configuration - repetitive and error-prone
async function login(username: string, password: string) {
  try {
    const response = await fetch('https://api.example.com/auth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(username + ':' + password)}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Handle 401
      } else if (response.status === 500) {
        // Handle 500
      }
      throw new Error('Login failed');
    }
    
    // Save token
    const token = data.access_token;
    localStorage.setItem('token', token);
    
    return data;
  } catch (error) {
    // Handle error
  }
}

// Get user data - repeat all the same code!
async function getUser() {
  const token = localStorage.getItem('token');
  const response = await fetch('https://api.example.com/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Repeat token logic
    }
  });
  // ... same error handling code again
}
```

**Problems:**
- ❌ Repeat headers on every request
- ❌ Manual error handling everywhere
- ❌ No automatic token injection
- ❌ Manual data extraction (`response.json()`)
- ❌ No centralized configuration
- ❌ Hard to maintain and update

---

## The Solution: Configure Once, Use Everywhere

### With Configuration (Clean and Reusable)

```typescript
// ✅ With configuration - clean and reusable
async function login(username: string, password: string) {
  const data = await publicInstance.get('/auth', {
    headers: { Authorization: `Basic ${btoa(username + ':' + password)}` }
  });
  
  // Set token once
  authInstance.tokenize(data.access_token);
  
  return data;
}

// Get user data - automatically includes token!
async function getUser() {
  const data = await authInstance.get('/user');
  // Token automatically added, errors automatically handled!
  return data;
}
```

**Benefits:**
- ✅ Centralized configuration
- ✅ Automatic token management
- ✅ Consistent error handling
- ✅ Less boilerplate code
- ✅ Easier maintenance

---

## Why Configure HTTP Clients?

### 1. Centralized Configuration

Set defaults once, apply everywhere:
- Base URL
- Default headers (`Content-Type`, etc.)
- Timeouts
- Request/response interceptors

```typescript
// Configure once
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

// Use everywhere - base URL and headers automatically included
const data = await apiClient.get('/users');
```

### 2. Automatic Token Management

Add token once, include in all requests:

```typescript
// Set token once
authInstance.tokenize('your-jwt-token');

// All future requests automatically include:
// Authorization: Bearer your-jwt-token
const userData = await authInstance.get('/user');
const posts = await authInstance.get('/posts');
```

### 3. Consistent Error Handling

Handle errors in one place:

```typescript
// Configure error handler once
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle all errors consistently
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

### 4. Less Boilerplate

No need to repeat:
- `response.json()` extraction
- Error checking
- Header setting
- Token management

```typescript
// Without configuration
const response = await fetch('/api/data');
const data = await response.json();
if (!response.ok) throw new Error('Failed');

// With configuration
const data = await apiClient.get('/api/data');
// Data already extracted, errors already handled!
```

### 5. Easier Maintenance

Change behavior in one place:

```typescript
// Update base URL in one place
apiClient.defaults.baseURL = 'https://new-api.example.com';

// All requests now use new base URL automatically
```

---

## When to Set Up HTTP Client Configuration

### ✅ Do Set Up When:

- **Early in the project** (before making many API calls)
- **You have 2+ API endpoints** (avoids repetition)
- **You need authentication** (token management)
- **You want consistent error handling** (better UX)
- **You're building a production app** (maintainability)

### ❌ Can Skip When:

- **Prototyping a single API call** (quick test)
- **Very simple projects** (one endpoint, no auth)
- **Learning/experimenting** (understanding basics first)

### Project Timeline

```
┌─────────────────────────────────────────────────────┐
│  Project Start                                      │
│  └─> Set up HTTP client configuration              │
│      (Do this FIRST, before making API calls)      │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  Build Features                                     │
│  └─> Use the configured client everywhere          │
│      (Now you can focus on features, not HTTP)     │
└─────────────────────────────────────────────────────┘
```

---

## Different Approaches

### Option 1: Axios (Recommended)

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  headers: { 'Content-Type': 'application/json' }
});

// Use
const data = await apiClient.get('/users');
```

**Pros:**
- ✅ Popular and well-documented
- ✅ Interceptors for requests/responses
- ✅ Automatic JSON parsing
- ✅ Request/response transformation
- ✅ Built-in TypeScript support

**Cons:**
- ❌ Additional dependency (but small)

### Option 2: Custom `apiClient` Wrapper

```typescript
// Create your own wrapper around fetch
const apiClient = {
  get: async (url: string) => {
    const response = await fetch(url);
    return response.json();
  },
  post: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

**Pros:**
- ✅ No extra dependencies
- ✅ Full control

**Cons:**
- ❌ More code to maintain
- ❌ Less features out of the box

### Option 3: Native `fetch` (No Configuration)

```typescript
// Just use fetch directly everywhere
const response = await fetch('/api/login');
const data = await response.json();
```

**Pros:**
- ✅ Built-in, no dependencies

**Cons:**
- ❌ Repetitive code
- ❌ Manual error handling
- ❌ No automatic token injection

---

## Real-World Example: Before vs After

### Before Configuration

```typescript
// Login function - messy version
async function login(username: string, password: string) {
  try {
    const response = await fetch('https://api.example.com/auth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(username + ':' + password)}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Handle 401
      } else if (response.status === 500) {
        // Handle 500
      }
      throw new Error('Login failed');
    }
    
    // Save token
    const token = data.access_token;
    localStorage.setItem('token', token);
    
    return data;
  } catch (error) {
    // Handle error
  }
}

// Get user data - repeat all the same code!
async function getUser() {
  const token = localStorage.getItem('token');
  const response = await fetch('https://api.example.com/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Repeat token logic
    }
  });
  // ... same error handling code again
}
```

### After Configuration

```typescript
// Login function - clean version
async function login(username: string, password: string) {
  const data = await publicInstance.get('/auth', {
    headers: { Authorization: `Basic ${btoa(username + ':' + password)}` }
  });
  
  // Set token once
  authInstance.tokenize(data.access_token);
  
  return data;
}

// Get user data - automatically includes token!
async function getUser() {
  const data = await authInstance.get('/user');
  // Token automatically added, errors automatically handled!
  return data;
}
```

**Result:**
- 70% less code
- Consistent error handling
- Automatic token management
- Easier to maintain

---

## Summary

### Key Takeaways

1. **HTTP client configuration eliminates repetition** - Configure once, use everywhere
2. **Set it up early** - Before making many API calls
3. **Centralized configuration** - Easier to maintain and update
4. **Automatic features** - Token management, error handling, data extraction
5. **Better code quality** - Less boilerplate, more maintainable

### Next Steps

- Read **[Module 2: Basic Authentication Overview](../02-basic-authentication-overview/02-basic-authentication-overview.md)** to understand authentication
- Study **[Module 4: Axios Provider Configuration](../04-axios-provider-configuration/04-axios-provider-configuration.md)** for implementation details

---

**The bottom line**: HTTP client configuration is a standard pattern in modern applications. It makes your code cleaner, more maintainable, and easier to work with. Set it up early in your project for maximum benefit.
