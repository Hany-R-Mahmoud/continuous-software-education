# Module 5: Frontend Token Management

> **Frontend Token Management**

---


### Token Storage Options

#### Web (Next.js) Storage Methods

**1. localStorage**
```typescript
// ✅ Pros: Persists across sessions, easy to use
// ❌ Cons: Vulnerable to XSS, accessible to JavaScript

// Store
localStorage.setItem('accessToken', token);

// Retrieve
const token = localStorage.getItem('accessToken');

// Remove
localStorage.removeItem('accessToken');
```

**2. sessionStorage**
```typescript
// ✅ Pros: Cleared when tab closes, easy to use
// ❌ Cons: Vulnerable to XSS, not shared across tabs

// Store
sessionStorage.setItem('accessToken', token);

// Retrieve
const token = sessionStorage.getItem('accessToken');
```

**3. Cookies (HttpOnly)**
```typescript
// ✅ Pros: HttpOnly = not accessible to JavaScript (XSS protection)
// ✅ Pros: Can be Secure (HTTPS only)
// ❌ Cons: Sent with every request (CSRF risk)
// ❌ Cons: Size limit (~4KB)

// Server-side (Next.js API route)
res.setHeader('Set-Cookie', [
  `accessToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`,
]);

// Client-side: Cannot read HttpOnly cookies (by design)
// Use API route to check authentication
```

**4. Memory (React State)**
```typescript
// ✅ Pros: Most secure (cleared on refresh)
// ❌ Cons: Lost on page refresh, not persistent

const [token, setToken] = useState<string | null>(null);
```

**5. Next.js Cookies (Server Components)**
```typescript
// app/actions.ts (Server Action)
import { cookies } from 'next/headers';

export async function setAuthToken(token: string) {
  cookies().set('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 900, // 15 minutes
  });
}

export async function getAuthToken() {
  return cookies().get('accessToken')?.value;
}
```

#### Mobile (React Native/Expo) Storage Methods

**1. Expo SecureStore** (Recommended)
```typescript
import * as SecureStore from 'expo-secure-store';

// ✅ Pros: Encrypted storage, secure
// ✅ Pros: Works on iOS and Android
// ❌ Cons: Expo only

// Store
await SecureStore.setItemAsync('accessToken', token);

// Retrieve
const token = await SecureStore.getItemAsync('accessToken');

// Remove
await SecureStore.deleteItemAsync('accessToken');
```

**2. React Native AsyncStorage**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Pros: Works without Expo
// ❌ Cons: Not encrypted (less secure)
// ⚠️ Use only for non-sensitive data or wrap with encryption

// Store
await AsyncStorage.setItem('accessToken', token);

// Retrieve
const token = await AsyncStorage.getItem('accessToken');

// Remove
await AsyncStorage.removeItem('accessToken');
```

**3. React Native Keychain** (iOS) / **Keystore** (Android)
```typescript
// Most secure, but more complex setup
// Use libraries like: react-native-keychain
```

### Security Implications

| Storage Method | XSS Risk | CSRF Risk | Persistence | Mobile Support |
|----------------|----------|-----------|-------------|----------------|
| localStorage | High | Low | Yes | No |
| sessionStorage | High | Low | Tab session | No |
| HttpOnly Cookie | Low | High | Yes | Limited |
| Memory | None | Low | No | Yes |
| SecureStore | Low | Low | Yes | Yes (Expo) |
| AsyncStorage | Medium | Low | Yes | Yes |

### Adding Tokens to API Request Headers

#### Axios Interceptors (Recommended)

```typescript
// lib/api-client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // For React Native
// or
// import { getAuthToken } from '@/lib/auth'; // For Next.js

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
});

// Request interceptor: Add token to every request
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from storage
    const token = await SecureStore.getItemAsync('accessToken');
    // or: const token = localStorage.getItem('accessToken');
    // or: const token = await getAuthToken(); // Next.js
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        });
        
        const { accessToken } = response.data;
        await SecureStore.setItemAsync('accessToken', accessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        await clearAllTokens();
        // Navigate to login (platform-specific)
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### Fetch API Wrapper

```typescript
// lib/api.ts
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  private async getToken(): Promise<string | null> {
    // Platform-specific token retrieval
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    // React Native
    return await SecureStore.getItemAsync('accessToken');
  }
  
  async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      // Handle token refresh
      await this.handleTokenRefresh();
      // Retry request
      return this.request(endpoint, options);
    }
    
    return response;
  }
  
  private async handleTokenRefresh() {
    // Token refresh logic
  }
}
```

### Token Refresh Logic

```typescript
// lib/token-manager.ts
class TokenManager {
  private refreshPromise: Promise<string> | null = null;
  
  async getAccessToken(): Promise<string | null> {
    // Check if token exists and is valid
    const token = await this.getStoredToken();
    if (token && !this.isTokenExpired(token)) {
      return token;
    }
    
    // Token expired or missing - refresh
    return await this.refreshAccessToken();
  }
  
  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    
    this.refreshPromise = this.performRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }
  
  private async performRefresh(): Promise<string | null> {
    const refreshToken = await this.getStoredRefreshToken();
    if (!refreshToken) {
      await this.clearTokens();
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Refresh failed');
      }
      
      const { accessToken, refreshToken: newRefreshToken } = await response.json();
      await this.storeTokens(accessToken, newRefreshToken);
      
      return accessToken;
    } catch (error) {
      await this.clearTokens();
      throw error;
    }
  }
  
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true; // If can't parse, consider expired
    }
  }
  
  // Platform-specific storage methods
  private async getStoredToken(): Promise<string | null> {
    // Implementation depends on platform
  }
  
  private async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    // Implementation depends on platform
  }
  
  private async clearTokens(): Promise<void> {
    // Implementation depends on platform
  }
}
```

### Protected Routes/Screens

#### Next.js Protected Pages

```typescript
// components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return null;
  }
  
  return <>{children}</>;
}

// Usage
// pages/dashboard.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Dashboard content</div>
    </ProtectedRoute>
  );
}
```

#### React Native Protected Screens

```typescript
// navigation/ProtectedStack.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedStack({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return null;
  }
  
  return <>{children}</>;
}

// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { verifyToken } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  async function checkAuth() {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        const userData = await verifyToken(token);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }
  
  return { user, loading, checkAuth };
}
```

---

## Related Visuals

### Infographics

![Frontend Token Management](infographic.jpg)

### Diagrams

![Frontend Token Management Diagram](diagram.png)

---

## Navigation

- [← Previous: Middleware Deep Dive](../04-middleware-deep-dive/04-middleware-deep-dive.md)
- [↑ Back to README](../../README.md)
- [Next: Backend Token Management →](../06-backend-token-management/06-backend-token-management.md)
