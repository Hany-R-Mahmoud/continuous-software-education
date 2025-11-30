# Module 7: Complete Implementation Examples

> **Complete Implementation Examples**

---


### Next.js Web App Example

#### Project Structure
```
nextjs-auth-example/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       ├── refresh/
│   │       └── logout/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx
├── lib/
│   ├── auth.ts
│   ├── token-manager.ts
│   └── api-client.ts
├── middleware.ts
└── components/
    └── ProtectedRoute.tsx
```

#### Complete Files

**`lib/auth.ts`**
```typescript
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface User {
  id: string;
  email: string;
  role: string;
}

export function generateTokens(user: User) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { sub: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

export function verifyToken(token: string): User {
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  return {
    id: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get('accessToken')?.value;
  if (!token) return null;
  
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
```

**`app/api/auth/login/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateTokens } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // Validate credentials (simplified - use real DB in production)
  if (email === 'user@example.com' && password === 'password') {
    const user = { id: '1', email, role: 'user' };
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Set cookies
    cookies().set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 900, // 15 minutes
    });
    
    cookies().set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800, // 7 days
    });
    
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 }
  );
}
```

**`middleware.ts`**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
```

### React Native/Expo App Example

#### Project Structure
```
react-native-auth-example/
├── app/
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (tabs)/
│   │   └── dashboard.tsx
│   └── _layout.tsx
├── lib/
│   ├── auth.ts
│   ├── secure-storage.ts
│   └── api-client.ts
└── hooks/
    └── useAuth.ts
```

**`lib/secure-storage.ts`**
```typescript
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export async function storeTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
```

**`lib/api-client.ts`**
```typescript
import axios from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from './secure-storage';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await getRefreshToken();
        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        await storeTokens(accessToken, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        await clearTokens();
        // Navigate to login
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

**`app/(auth)/login.tsx`**
```typescript
import { useState } from 'react';
import { router } from 'expo-router';
import { storeTokens } from '@/lib/secure-storage';
import apiClient from '@/lib/api-client';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  async function handleLogin() {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = response.data;
      await storeTokens(accessToken, refreshToken);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    // Login form UI
  );
}
```

### Express Backend Example

**`server/index.ts`**
```typescript
import express from 'express';
import cors from 'cors';
import { authenticateToken } from './middleware/auth';
import { login, refresh, logout } from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.post('/api/auth/login', login);
app.post('/api/auth/refresh', refresh);

// Protected routes
app.post('/api/auth/logout', authenticateToken, logout);
app.get('/api/user/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**`server/middleware/auth.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## Related Visuals

### Infographics

![Complete Implementation Examples](infographic.jpg)

### Diagrams

![Complete Implementation Examples Diagram](diagram.png)

---

## Navigation

- [← Previous: Backend Token Management](../06-backend-token-management/06-backend-token-management.md)
- [↑ Back to README](../../README.md)
- [Next: Security Best Practices →](../08-security-best-practices/08-security-best-practices.md)
