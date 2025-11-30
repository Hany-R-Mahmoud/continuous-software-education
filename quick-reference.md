# Authentication & Token Management - Quick Reference

> **A quick cheat sheet for authentication concepts, patterns, and code snippets**

---

## Core Concepts

### Authentication vs Authorization
- **Authentication**: "Who are you?" - Verifies identity
- **Authorization**: "What can you do?" - Checks permissions

### Sessions vs Tokens
| Aspect | Sessions | Tokens |
|--------|----------|--------|
| **Storage** | Server-side | Client-side |
| **State** | Stateful | Stateless |
| **Revocation** | Easy | Hard (until expiry) |
| **Scalability** | Requires shared storage | Scales well |
| **Use Case** | Traditional web apps | SPAs, Mobile, Microservices |

---

## Token Types

### Access Token
- **Lifetime**: 15 minutes - 1 hour
- **Purpose**: Authenticate API requests
- **Storage**: Memory or secure storage
- **Contains**: User ID, email, role, permissions

### Refresh Token
- **Lifetime**: 7 - 30 days
- **Purpose**: Get new access tokens
- **Storage**: Secure storage only (HttpOnly cookie or SecureStore)
- **Contains**: User ID, token version

---

## JWT Structure

```
HEADER.PAYLOAD.SIGNATURE

Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "user123", "email": "...", "iat": ..., "exp": ... }
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

---

## Token Storage - Quick Guide

### Web (Next.js)
- ✅ **Best**: HttpOnly cookies
- ⚠️ **Acceptable**: Memory (lost on refresh)
- ❌ **Avoid**: localStorage (XSS vulnerable)

### Mobile (React Native/Expo)
- ✅ **Best**: SecureStore (encrypted)
- ⚠️ **Acceptable**: AsyncStorage with encryption
- ❌ **Avoid**: Plain AsyncStorage

---

## Code Snippets

### Next.js - Store Tokens in Cookies

```typescript
import { cookies } from 'next/headers';

// Store
cookies().set('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 900, // 15 minutes
});

// Get
const token = cookies().get('accessToken')?.value;

// Delete
cookies().delete('accessToken');
```

### React Native - Store Tokens in SecureStore

```typescript
import * as SecureStore from 'expo-secure-store';

// Store
await SecureStore.setItemAsync('accessToken', token);

// Get
const token = await SecureStore.getItemAsync('accessToken');

// Delete
await SecureStore.deleteItemAsync('accessToken');
```

### Add Token to Request Headers

```typescript
// Axios
config.headers.Authorization = `Bearer ${token}`;

// Fetch
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Express - Auth Middleware

```typescript
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Next.js - API Route Middleware

```typescript
export function authenticateToken(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = decoded;
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

### Next.js - File-based Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const isProtected = request.nextUrl.pathname.startsWith('/dashboard');
  
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

### Axios - Token Refresh Interceptor

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = await getRefreshToken();
      const { data } = await axios.post('/api/auth/refresh', { refreshToken });
      
      await storeTokens(data.accessToken, data.refreshToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    }
    
    return Promise.reject(error);
  }
);
```

### Generate Tokens

```typescript
import jwt from 'jsonwebtoken';

const accessToken = jwt.sign(
  { sub: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '15m' }
);

const refreshToken = jwt.sign(
  { sub: user.id, tokenVersion: user.tokenVersion },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);
```

### Verify Token

```typescript
import jwt from 'jsonwebtoken';

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  // Use decoded data
} catch (error) {
  if (error instanceof jwt.TokenExpiredError) {
    // Token expired
  } else if (error instanceof jwt.JsonWebTokenError) {
    // Invalid token
  }
}
```

### Check Token Expiry

```typescript
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
```

---

## Security Checklist

### Token Security
- [ ] Use HTTPS in production
- [ ] Short access token expiry (15 min)
- [ ] Long refresh token expiry (7 days)
- [ ] Rotate refresh tokens
- [ ] Never store tokens in URLs
- [ ] Use strong JWT secrets (32+ chars)

### Storage Security
- [ ] HttpOnly cookies for web
- [ ] SecureStore for mobile
- [ ] Never use localStorage for tokens
- [ ] Clear tokens on logout

### Protection
- [ ] XSS: HttpOnly cookies, input sanitization
- [ ] CSRF: SameSite cookies, CSRF tokens
- [ ] MITM: HTTPS, certificate validation
- [ ] Token theft: Short expiry, rotation

---

## Common Patterns

### Protected Route (Next.js)

```typescript
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);
  
  if (loading || !user) return <Loading />;
  return <>{children}</>;
}
```

### Protected Screen (React Native)

```typescript
export function ProtectedStack({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading]);
  
  if (loading || !user) return <LoadingScreen />;
  return <>{children}</>;
}
```

### Token Manager Class

```typescript
class TokenManager {
  async getAccessToken(): Promise<string | null> {
    const token = await this.getStoredToken();
    if (token && !this.isTokenExpired(token)) {
      return token;
    }
    return await this.refreshAccessToken();
  }
  
  private async refreshAccessToken(): Promise<string | null> {
    // Refresh logic
  }
}
```

---

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **401**: Unauthorized (invalid/expired token)
- **403**: Forbidden (valid token but insufficient permissions)
- **400**: Bad Request (missing/invalid data)

### Token Errors
- `TokenExpiredError`: Token has expired
- `JsonWebTokenError`: Invalid token format
- `NotBeforeError`: Token not yet valid

---

## Platform-Specific Notes

### Next.js
- Use `middleware.ts` for route protection
- Use `cookies()` API for server components
- HttpOnly cookies for refresh tokens
- API routes for authentication endpoints

### React Native/Expo
- Use SecureStore for token storage
- Axios interceptors for token management
- Handle background/foreground token refresh
- Network state handling

### Express
- Middleware runs in order
- Must call `next()` or send response
- Error middleware should be last
- TypeScript: Extend Request interface

---

## Token Expiration Times

| Token Type | Typical Lifetime | Reason |
|------------|------------------|--------|
| Access Token | 15 minutes | Security - limits damage if stolen |
| Refresh Token | 7 days | UX - avoids frequent re-login |
| Password Reset | 1 hour | Security - time-limited reset |

---

## Decision Tree

### When to Use Sessions?
- ✅ Traditional server-rendered apps
- ✅ Need immediate revocation
- ✅ Server-side session management
- ✅ Cookie-based auth acceptable

### When to Use Tokens?
- ✅ Single Page Applications (SPAs)
- ✅ Mobile apps
- ✅ Microservices
- ✅ Stateless authentication
- ✅ Cross-domain auth

### Storage Method?

**Web:**
- Need persistence? → HttpOnly cookies
- Don't need persistence? → Memory
- ❌ Never: localStorage

**Mobile:**
- Expo? → SecureStore
- React Native? → SecureStore or Keychain
- ❌ Never: Plain AsyncStorage

---

## Quick Debugging

### Token Not Working?
1. Check token is in request header: `Authorization: Bearer <token>`
2. Verify token format (three parts separated by dots)
3. Check token expiry
4. Verify JWT_SECRET matches
5. Check token signature

### 401 Unauthorized?
- Token missing → Add to request header
- Token expired → Refresh token
- Invalid token → Re-login
- Wrong secret → Check JWT_SECRET

### Middleware Not Running?
- Check middleware order
- Verify `next()` is called
- Check route matcher config (Next.js)
- Verify middleware is applied to route

---

## TypeScript Types

```typescript
interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

---

## Key Takeaways

1. **Authentication** = Identity, **Authorization** = Permissions
2. **Sessions** = Server storage, **Tokens** = Client storage
3. **Access tokens** = Short-lived, **Refresh tokens** = Long-lived
4. **HttpOnly cookies** (web) or **SecureStore** (mobile) for storage
5. **Middleware** runs in order, must call `next()` or send response
6. **Always use HTTPS** in production
7. **Rotate refresh tokens** for security
8. **Short access token expiry** limits damage if stolen

---

**Last Updated**: 2024

