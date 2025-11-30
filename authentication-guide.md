# Authentication & Token Management - Complete Teaching Guide

> **A comprehensive guide to understanding authentication, sessions, tokens, and middleware in TypeScript, Next.js, and React Native/Expo**

---

## Table of Contents

1. [Foundation Concepts](#module-1-foundation-concepts)
2. [Token Types & Structure](#module-2-token-types--structure)
3. [Authentication Flows](#module-3-authentication-flows)
4. [Middleware Deep Dive](#module-4-middleware-deep-dive)
5. [Frontend Token Management](#module-5-frontend-token-management)
6. [Backend Token Management](#module-6-backend-token-management)
7. [Complete Implementation Examples](#module-7-complete-implementation-examples)
8. [Security Best Practices](#module-8-security-best-practices)
9. [Practical Exercises](#module-9-practical-exercises)

---

## Module 1: Foundation Concepts

### Authentication vs Authorization

**Authentication** = "Who are you?" (Identity verification)
- Verifies that a user is who they claim to be
- Examples: Login with username/password, biometric authentication
- Result: User identity is confirmed

**Authorization** = "What can you do?" (Permission checking)
- Determines what resources/actions a user can access
- Examples: Admin-only pages, user-specific data access
- Result: Access granted or denied

**Analogy**: 
- **Authentication** is like showing your ID at a club entrance (proving who you are)
- **Authorization** is like the bouncer checking if you're on the VIP list (what you can access)

```typescript
// Authentication: Verifying identity
async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (user && await verifyPassword(password, user.hashedPassword)) {
    return user; // ✅ Authenticated
  }
  return null; // ❌ Authentication failed
}

// Authorization: Checking permissions
function canAccessResource(user: User, resource: Resource): boolean {
  if (user.role === 'admin') return true;
  if (resource.ownerId === user.id) return true;
  return false; // ❌ Not authorized
}
```

### Sessions vs Tokens

#### Sessions (Stateful)
- **What**: Server stores authentication state
- **How**: Server creates a session ID, stores it in memory/database, sends ID to client
- **Client stores**: Session ID (usually in cookie)
- **Server stores**: Session data (user info, expiration)

**Flow**:
```
1. User logs in → Server creates session → Stores in memory/DB
2. Server sends session ID (cookie) → Client stores cookie
3. Client sends session ID with each request
4. Server looks up session → Validates → Returns data
5. User logs out → Server destroys session
```

**Pros**:
- Server has full control
- Easy to revoke (delete session)
- Can store additional data server-side

**Cons**:
- Requires server-side storage
- Doesn't scale well (needs shared storage for multiple servers)
- More complex for mobile apps

#### Tokens (Stateless)
- **What**: Self-contained authentication data
- **How**: Server creates token with user info, signs it, sends to client
- **Client stores**: Token (localStorage, SecureStore, memory)
- **Server stores**: Nothing (token is self-contained)

**Flow**:
```
1. User logs in → Server creates token → Signs it
2. Server sends token → Client stores token
3. Client sends token with each request (in header)
4. Server validates token signature → Extracts user info
5. User logs out → Client deletes token (server can't revoke until expiry)
```

**Pros**:
- Stateless (no server storage needed)
- Scales well (works across multiple servers)
- Works great for mobile/SPAs
- Can contain user data (reduces DB queries)

**Cons**:
- Harder to revoke (must wait for expiry or use token blacklist)
- Larger request size (token in every request)
- Security depends on proper storage

### When to Use Sessions vs Tokens

**Use Sessions when**:
- Traditional web apps with server-side rendering
- Need immediate revocation capability
- Want server-side session management
- Working with cookies is acceptable

**Use Tokens when**:
- Single Page Applications (SPAs)
- Mobile apps (React Native)
- Microservices architecture
- Need stateless authentication
- Cross-domain authentication

### Stateless vs Stateful Authentication

**Stateful (Sessions)**:
```
Client → Request with Session ID → Server
                                    ↓
                              Check Session Store
                                    ↓
                              Valid? → Return Data
```

**Stateless (Tokens)**:
```
Client → Request with Token → Server
                               ↓
                         Validate Token Signature
                               ↓
                         Valid? → Extract User Info → Return Data
```

### Web vs Mobile Differences

| Aspect | Web (Next.js) | Mobile (React Native/Expo) |
|--------|---------------|----------------------------|
| **Storage** | localStorage, cookies, sessionStorage | SecureStore, AsyncStorage |
| **Cookies** | Native support | Not available (use headers) |
| **Security** | HTTPS + HttpOnly cookies | SecureStore (encrypted) |
| **Token Refresh** | Can use cookies | Must use headers |
| **Background** | Tab can stay active | App may be backgrounded |
| **Network** | Usually stable | Can be intermittent |

### Core Terminology

- **Access Token**: Short-lived token for API access (15min - 1hr)
- **Refresh Token**: Long-lived token to get new access tokens (days/weeks)
- **JWT (JSON Web Token)**: Standard token format (Header.Payload.Signature)
- **Bearer Token**: Token sent in Authorization header (`Bearer <token>`)
- **Session**: Server-side stored authentication state
- **Cookie**: Small data stored by browser (can be HttpOnly, Secure)
- **Middleware**: Code that runs before/after request handling
- **Interceptor**: Code that modifies requests/responses (Axios)
- **CORS**: Cross-Origin Resource Sharing (web security)
- **XSS**: Cross-Site Scripting (injecting malicious code)
- **CSRF**: Cross-Site Request Forgery (unauthorized actions)

---

## Module 2: Token Types & Structure

### JWT (JSON Web Token) Structure

A JWT has three parts separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Format**: `HEADER.PAYLOAD.SIGNATURE`

#### 1. Header
Contains token type and signing algorithm:
```json
{
  "alg": "HS256",  // Algorithm (HMAC SHA256)
  "typ": "JWT"     // Type (always JWT)
}
```
Base64Url encoded → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

#### 2. Payload (Claims)
Contains user data and metadata:
```json
{
  "sub": "1234567890",           // Subject (user ID)
  "name": "John Doe",            // User name
  "email": "john@example.com",   // User email
  "iat": 1516239022,             // Issued at (timestamp)
  "exp": 1516242622,             // Expiration (timestamp)
  "role": "user"                 // Custom claim
}
```
Base64Url encoded → `eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ`

#### 3. Signature
Created by signing header + payload with secret:
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### Access Tokens vs Refresh Tokens

#### Access Token
- **Purpose**: Authenticate API requests
- **Lifetime**: Short (15 minutes - 1 hour)
- **Storage**: Memory or secure storage
- **Contains**: User ID, permissions, expiration
- **Usage**: Sent with every API request

```typescript
interface AccessTokenPayload {
  sub: string;        // User ID
  email: string;
  role: string;
  iat: number;        // Issued at
  exp: number;        // Expires at (short)
}
```

#### Refresh Token
- **Purpose**: Get new access tokens
- **Lifetime**: Long (7 days - 30 days)
- **Storage**: Secure storage only (HttpOnly cookie or SecureStore)
- **Contains**: User ID, token version (for rotation)
- **Usage**: Only sent to refresh endpoint

```typescript
interface RefreshTokenPayload {
  sub: string;        // User ID
  tokenVersion: number; // For rotation/revocation
  iat: number;
  exp: number;        // Expires at (long)
}
```

### Token Expiration Strategy

**Why expiration matters**:
- Limits damage if token is stolen
- Forces re-authentication periodically
- Allows revocation through refresh token rotation

**Common Pattern**:
```
Access Token: 15 minutes
Refresh Token: 7 days
```

**Flow**:
1. Access token expires → Client detects 401
2. Client uses refresh token → Gets new access token
3. If refresh token expires → User must login again

### TypeScript Token Types

```typescript
// Token payload types
export interface JWTPayload {
  sub: string;           // Subject (user ID)
  iat: number;          // Issued at
  exp: number;           // Expires at
  [key: string]: any;   // Additional claims
}

export interface AccessTokenPayload extends JWTPayload {
  email: string;
  role: string;
  permissions?: string[];
}

export interface RefreshTokenPayload extends JWTPayload {
  tokenVersion: number;
}

// Token response types
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;    // Seconds until access token expires
}

// Decoded token (after verification)
export interface DecodedToken<T extends JWTPayload = JWTPayload> {
  payload: T;
  header: {
    alg: string;
    typ: string;
  };
}
```

### Token Claims Best Practices

**Standard Claims (RFC 7519)**:
- `sub` (subject): User ID
- `iat` (issued at): Timestamp
- `exp` (expires at): Timestamp
- `iss` (issuer): Who created the token
- `aud` (audience): Who the token is for

**Custom Claims**:
- Keep minimal (don't store sensitive data)
- Don't store passwords or secrets
- Store only what's needed for authorization
- Consider token size (affects request size)

---

## Module 3: Authentication Flows

### Login Flow

**Complete Login Flow**:

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant Database

    User->>Client: Enter credentials
    Client->>Server: POST /auth/login (email, password)
    Server->>Database: Verify credentials
    Database-->>Server: User data
    Server->>Server: Generate tokens
    Server-->>Client: { accessToken, refreshToken }
    Client->>Client: Store tokens securely
    Client->>User: Redirect to dashboard
```

**Implementation**:

```typescript
// Client-side (Next.js)
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const { accessToken, refreshToken } = await response.json();
  
  // Store tokens (platform-specific)
  await storeTokens(accessToken, refreshToken);
  
  return { accessToken, refreshToken };
}

// Server-side (Express)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Find user
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  // 2. Verify password
  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
  
  // 3. Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // 4. Store refresh token (optional - for rotation)
  await storeRefreshToken(user.id, refreshToken);
  
  // 5. Return tokens
  res.json({
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes
  });
});
```

### Registration Flow

```typescript
// Client-side
async function register(email: string, password: string, name: string) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const { accessToken, refreshToken } = await response.json();
  await storeTokens(accessToken, refreshToken);
  
  return { accessToken, refreshToken };
}

// Server-side
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  // 1. Validate input
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // 2. Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 4. Create user
  const user = await User.create({
    email,
    hashedPassword,
    name,
    role: 'user',
  });
  
  // 5. Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  res.status(201).json({
    accessToken,
    refreshToken,
    expiresIn: 900,
  });
});
```

### Token Refresh Flow

**Why refresh tokens?**
- Access tokens expire quickly (security)
- Refresh tokens allow getting new access tokens without re-login
- Better user experience

**Flow**:

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth Server

    Client->>API: Request with expired access token
    API-->>Client: 401 Unauthorized
    Client->>Auth Server: POST /auth/refresh (refreshToken)
    Auth Server->>Auth Server: Validate refresh token
    Auth Server-->>Client: New accessToken (and new refreshToken)
    Client->>Client: Store new tokens
    Client->>API: Retry request with new access token
    API-->>Client: 200 OK
```

**Implementation**:

```typescript
// Client-side token refresh
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      
      if (!response.ok) {
        // Refresh token expired - need to login again
        await this.clearTokens();
        throw new Error('Refresh token expired');
      }
      
      const { accessToken, refreshToken } = await response.json();
      await this.storeTokens(accessToken, refreshToken);
      
      return accessToken;
    } catch (error) {
      await this.clearTokens();
      throw error;
    }
  }
  
  async getAccessToken(): Promise<string> {
    if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
      return this.accessToken;
    }
    
    return await this.refreshAccessToken();
  }
}

// Server-side refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  try {
    // 1. Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // 2. Check if token was revoked (if using rotation)
    const storedToken = await getStoredRefreshToken(decoded.sub);
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // 3. Get user
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // 4. Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // 5. Update stored refresh token (rotation)
    await updateRefreshToken(user.id, newRefreshToken);
    
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

### Logout Flow

**Simple Logout** (Client-side only):
```typescript
async function logout() {
  // Just delete tokens from client
  await clearTokens();
  // Redirect to login
  router.push('/login');
}
```

**Secure Logout** (Server-side revocation):
```typescript
// Client-side
async function logout() {
  try {
    // Notify server to revoke refresh token
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    // Even if server call fails, clear local tokens
    console.error('Logout error:', error);
  } finally {
    await clearTokens();
    router.push('/login');
  }
}

// Server-side
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  const { refreshToken } = req.body;
  const userId = req.user.id;
  
  // Revoke refresh token
  await revokeRefreshToken(userId, refreshToken);
  
  res.json({ message: 'Logged out successfully' });
});
```

### Password Reset Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant Email

    User->>Client: Request password reset
    Client->>Server: POST /auth/forgot-password (email)
    Server->>Server: Generate reset token
    Server->>Email: Send reset link
    Email->>User: Reset link with token
    User->>Client: Click reset link
    Client->>Server: POST /auth/reset-password (token, newPassword)
    Server->>Server: Validate token & update password
    Server-->>Client: Success
```

---

## Module 4: Middleware Deep Dive

### What is Middleware?

**Definition**: Middleware is code that runs between a request and response. It can:
- Modify the request/response
- Execute additional logic
- Terminate the request early
- Pass control to the next middleware

**Analogy**: Like security checkpoints at an airport - each checkpoint (middleware) checks something before you proceed.

### Why Do We Need Middleware?

1. **Separation of Concerns**: Keep authentication logic separate from business logic
2. **Reusability**: Write once, use in multiple routes
3. **Security**: Centralized authentication/authorization
4. **Request Processing**: Logging, validation, transformation
5. **Error Handling**: Centralized error responses

### Middleware Execution Flow

```
Request → Middleware 1 → Middleware 2 → Middleware 3 → Route Handler → Response
           ↓              ↓              ↓
        Can modify    Can modify    Can modify
        Can stop      Can stop      Can stop
```

### Next.js Middleware

#### File-based Middleware (`middleware.ts`)

**Location**: `middleware.ts` in project root (or `src/`)

**Runs on**: Edge runtime (fast, but limited APIs)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Get token from cookie or header
  const token = request.cookies.get('accessToken')?.value 
    || request.headers.get('authorization')?.replace('Bearer ', '');
  
  // 2. Check if route needs authentication
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  
  // 3. If no token and protected route → redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 4. If token exists and on auth route → redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 5. Add custom header to request
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  
  return response;
}

// Configure which routes middleware runs on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/api/protected/:path*',
  ],
};
```

#### Next.js API Route Middleware

**Location**: Inside API route files

```typescript
// lib/auth-middleware.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticateToken(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // 1. Get token from header
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1]; // "Bearer <token>"
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // 3. Attach user to request
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
      
      // 4. Call the actual route handler
      return await handler(req, res);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(500).json({ error: 'Authentication error' });
    }
  };
}

// Usage in API route
// pages/api/protected/route.ts or app/api/protected/route.ts
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth-middleware';

export default authenticateToken(async (req: AuthenticatedRequest, res) => {
  // req.user is now available!
  res.json({ 
    message: 'Protected data',
    user: req.user,
  });
});
```

### Express Middleware

#### Basic Auth Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // "Bearer <token>"
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // 3. Attach user to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    
    // 4. Continue to next middleware/route
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
}

// Usage
import express from 'express';
import { authenticateToken } from './middleware/auth';

const app = express();

// Apply to specific route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Protected data',
    user: req.user, // TypeScript knows about req.user!
  });
});

// Apply to all routes in a router
const protectedRouter = express.Router();
protectedRouter.use(authenticateToken); // All routes below need auth

protectedRouter.get('/profile', (req, res) => {
  res.json({ user: req.user });
});

protectedRouter.get('/settings', (req, res) => {
  res.json({ settings: '...' });
});

app.use('/api/user', protectedRouter);
```

#### Authorization Middleware

```typescript
// middleware/authorize.ts
import { Request, Response, NextFunction } from 'express';

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage
app.get('/api/admin', 
  authenticateToken,           // First: check authentication
  requireRole('admin'),         // Then: check authorization
  (req, res) => {
    res.json({ message: 'Admin only' });
  }
);
```

### Middleware Chain and Execution Order

**Important**: Middleware executes in the order it's defined!

```typescript
app.use(middleware1);  // Runs first
app.use(middleware2);  // Runs second
app.use(middleware3);  // Runs third

app.get('/route', 
  middleware4,  // Runs fourth
  middleware5,  // Runs fifth
  handler       // Runs last
);
```

**Example with multiple middleware**:

```typescript
// 1. Logging middleware (runs for all requests)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 2. Body parsing middleware
app.use(express.json());

// 3. CORS middleware
app.use(cors());

// 4. Authentication middleware (only for protected routes)
app.use('/api/protected', authenticateToken);

// 5. Route handler
app.get('/api/protected/data', (req, res) => {
  res.json({ data: '...' });
});
```

### Error Handling in Middleware

```typescript
// middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

// Usage (must be last!)
app.use(errorHandler);
```

### TypeScript Middleware Patterns

#### Type-Safe Middleware Factory

```typescript
// types/middleware.ts
import { Request, Response, NextFunction } from 'express';

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type AsyncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Wrapper for async middleware (handles errors)
export function asyncHandler(fn: AsyncMiddleware): Middleware {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
export const myAsyncMiddleware = asyncHandler(async (req, res, next) => {
  // Async operations
  await someAsyncOperation();
  next();
});
```

#### Generic Middleware with Type Parameters

```typescript
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

function createAuthMiddleware<T extends AuthenticatedRequest = AuthenticatedRequest>() {
  return async (req: T, res: Response, next: NextFunction) => {
    // Authentication logic
    req.user = { id: '...', email: '...', role: '...' };
    next();
  };
}
```

### Key Takeaways: Middleware

1. **Middleware runs in order** - Define carefully
2. **Call `next()`** - Or request hangs
3. **Error handling** - Use try/catch or error middleware
4. **Type safety** - Extend Request type for TypeScript
5. **Reusability** - Create middleware functions, not inline code
6. **Separation** - Keep auth/validation separate from business logic

---

## Module 5: Frontend Token Management

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

## Module 6: Backend Token Management

### Token Generation and Signing

```typescript
// lib/token-utils.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export function generateAccessToken(user: User): string {
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(user: User): string {
  const payload: RefreshTokenPayload = {
    sub: user.id,
    tokenVersion: user.tokenVersion || 0,
    iat: Math.floor(Date.now() / 1000),
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}
```

### Token Validation Middleware

```typescript
// middleware/validate-token.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function validateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AccessTokenPayload;
    
    // 3. Check expiration (jwt.verify does this, but explicit check)
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // 4. Attach to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Token validation error' });
  }
}
```

### Token Expiry Handling

```typescript
// lib/token-expiry.ts
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded?.exp) return true;
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
}

export function getTokenExpirationTime(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    return decoded?.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

// Middleware that checks expiry before validation
export function checkTokenExpiry(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token && isTokenExpired(token)) {
    return res.status(401).json({ 
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }
  
  next();
}
```

### Refresh Token Rotation

**Why rotate?** Security - if refresh token is stolen, old one becomes invalid.

```typescript
// lib/refresh-token-rotation.ts
import { User } from '@/models/User';

export async function rotateRefreshToken(
  userId: string,
  oldRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  // 1. Verify old refresh token
  const decoded = jwt.verify(oldRefreshToken, JWT_SECRET) as RefreshTokenPayload;
  
  // 2. Get user and check token version
  const user = await User.findById(userId);
  if (!user || user.tokenVersion !== decoded.tokenVersion) {
    throw new Error('Invalid refresh token');
  }
  
  // 3. Increment token version (invalidates old tokens)
  user.tokenVersion += 1;
  await user.save();
  
  // 4. Generate new tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // 5. Optionally: Store refresh token in database (for revocation)
  await storeRefreshToken(userId, refreshToken);
  
  return { accessToken, refreshToken };
}

// Refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  try {
    const { accessToken, refreshToken: newRefreshToken } = 
      await rotateRefreshToken(userId, refreshToken);
    
    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

### Session Management (If Using Sessions)

```typescript
// lib/session-manager.ts
import { Session } from '@/models/Session';

export async function createSession(userId: string): Promise<string> {
  const sessionId = generateSessionId();
  
  await Session.create({
    sessionId,
    userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: new Date(),
  });
  
  return sessionId;
}

export async function validateSession(sessionId: string): Promise<string | null> {
  const session = await Session.findOne({
    sessionId,
    expiresAt: { $gt: new Date() }, // Not expired
  });
  
  if (!session) {
    return null;
  }
  
  return session.userId;
}

export async function destroySession(sessionId: string): Promise<void> {
  await Session.deleteOne({ sessionId });
}

// Middleware for session-based auth
export function validateSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ error: 'No session' });
  }
  
  validateSession(sessionId)
    .then((userId) => {
      if (!userId) {
        return res.status(401).json({ error: 'Invalid session' });
      }
      req.userId = userId;
      next();
    })
    .catch(() => {
      res.status(500).json({ error: 'Session validation error' });
    });
}
```

### TypeScript Backend Patterns

```typescript
// types/express.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
      userId?: string; // For session-based auth
    }
  }
}

// lib/auth-helpers.ts
export function requireAuth(req: Request): asserts req is Request & { user: NonNullable<Request['user']> } {
  if (!req.user) {
    throw new Error('Not authenticated');
  }
}

export function requireRole(req: Request, role: string): void {
  requireAuth(req);
  if (req.user!.role !== role) {
    throw new Error('Insufficient permissions');
  }
}

// Usage in route
app.get('/api/admin', authenticateToken, (req, res) => {
  requireRole(req, 'admin');
  // TypeScript knows req.user exists and is admin
  res.json({ message: 'Admin data' });
});
```

---

## Module 7: Complete Implementation Examples

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

## Module 8: Security Best Practices

### HTTPS Requirements

**Always use HTTPS in production!**

- Tokens transmitted over HTTP can be intercepted
- Use HTTPS for all API endpoints
- Set `Secure` flag on cookies (HTTPS only)

```typescript
// Cookie settings
cookies().set('accessToken', token, {
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  httpOnly: true,
  sameSite: 'strict',
});
```

### Token Storage Security

**Web (Next.js)**:
- ✅ **Best**: HttpOnly cookies (not accessible to JavaScript)
- ⚠️ **Acceptable**: Memory (lost on refresh)
- ❌ **Avoid**: localStorage (XSS vulnerable)

**Mobile (React Native)**:
- ✅ **Best**: SecureStore (encrypted)
- ⚠️ **Acceptable**: AsyncStorage with encryption wrapper
- ❌ **Avoid**: Plain AsyncStorage for tokens

### XSS Protection

**Cross-Site Scripting (XSS)**: Attacker injects malicious JavaScript

**Protections**:
1. **HttpOnly cookies** - JavaScript can't access
2. **Content Security Policy (CSP)** - Restrict script sources
3. **Input sanitization** - Clean user inputs
4. **Avoid `dangerouslySetInnerHTML`** - Use safe alternatives

```typescript
// ❌ Vulnerable to XSS
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Safe
<div>{userContent}</div> // React escapes automatically
```

### CSRF Protection

**Cross-Site Request Forgery (CSRF)**: Attacker makes requests from user's browser

**Protections**:
1. **SameSite cookies** - Prevent cross-site requests
2. **CSRF tokens** - Validate on state-changing requests
3. **Origin checking** - Verify request origin

```typescript
// Set SameSite on cookies
cookies().set('accessToken', token, {
  sameSite: 'strict', // or 'lax'
  httpOnly: true,
  secure: true,
});
```

### Token Rotation Strategies

**Refresh Token Rotation**:
- Issue new refresh token on each refresh
- Invalidate old refresh token
- Limits damage if token is stolen

**Token Versioning**:
- Store version in user record
- Include version in token
- Increment on password change/logout all devices

```typescript
// User model
interface User {
  id: string;
  tokenVersion: number; // Increment to invalidate all tokens
}

// On password change
user.tokenVersion += 1;
await user.save();

// Token validation
if (decoded.tokenVersion !== user.tokenVersion) {
  throw new Error('Token invalidated');
}
```

### Platform-Specific Security

**Next.js**:
- Use middleware for route protection
- Server-side token validation
- HttpOnly cookies for refresh tokens

**React Native**:
- Use SecureStore (encrypted storage)
- Validate certificates (prevent MITM)
- Secure network communication

### Common Vulnerabilities

**1. Token in URL**
```typescript
// ❌ NEVER do this
fetch(`/api/data?token=${token}`);

// ✅ Use headers
fetch('/api/data', {
  headers: { Authorization: `Bearer ${token}` },
});
```

**2. Weak Secrets**
```typescript
// ❌ Weak secret
const secret = 'mysecret';

// ✅ Strong secret (environment variable)
const secret = process.env.JWT_SECRET!; // 32+ random characters
```

**3. Long Token Expiry**
```typescript
// ❌ Too long
{ expiresIn: '30d' }

// ✅ Short access token
{ expiresIn: '15m' } // Access token
{ expiresIn: '7d' }  // Refresh token
```

**4. Storing Sensitive Data in Tokens**
```typescript
// ❌ Don't store passwords, secrets
const payload = {
  sub: user.id,
  password: user.password, // NEVER!
};

// ✅ Only store necessary data
const payload = {
  sub: user.id,
  email: user.email,
  role: user.role,
};
```

---

## Module 9: Practical Exercises

### Exercise 1: Implement Token Storage (Next.js)

**Task**: Create a token storage utility for Next.js that:
- Stores access token in HttpOnly cookie
- Stores refresh token in HttpOnly cookie
- Provides functions to get/clear tokens

**Solution**:
```typescript
// lib/token-storage.ts
import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export async function storeTokens(accessToken: string, refreshToken: string) {
  cookies().set(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 900, // 15 minutes
  });
  
  cookies().set(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 604800, // 7 days
  });
}

export async function getAccessToken(): Promise<string | null> {
  return cookies().get(ACCESS_TOKEN_KEY)?.value || null;
}

export async function getRefreshToken(): Promise<string | null> {
  return cookies().get(REFRESH_TOKEN_KEY)?.value || null;
}

export async function clearTokens() {
  cookies().delete(ACCESS_TOKEN_KEY);
  cookies().delete(REFRESH_TOKEN_KEY);
}
```

### Exercise 2: Implement Token Storage (React Native)

**Task**: Create a token storage utility for React Native using SecureStore.

**Solution**:
```typescript
// lib/token-storage.ts
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

### Exercise 3: Create Auth Middleware (Express)

**Task**: Create authentication middleware that:
- Validates JWT token
- Handles expired tokens
- Attaches user to request

**Solution**: (See Module 4 for complete example)

### Exercise 4: Create Auth Middleware (Next.js)

**Task**: Create Next.js API route middleware wrapper.

**Solution**: (See Module 4 for complete example)

### Exercise 5: Build Refresh Token Flow

**Task**: Implement complete refresh token flow with:
- Automatic token refresh on 401
- Token rotation
- Error handling

**Solution**: (See Module 3 and Module 5 for complete examples)

---

## Key Takeaways

### Authentication Concepts
- **Authentication** = Who you are
- **Authorization** = What you can do
- **Sessions** = Server-side state
- **Tokens** = Self-contained, stateless

### Token Management
- **Access tokens**: Short-lived (15min-1hr)
- **Refresh tokens**: Long-lived (7-30 days)
- **Storage**: Secure (HttpOnly cookies or SecureStore)
- **Rotation**: Issue new refresh token on each refresh

### Middleware
- Runs between request and response
- Executes in order
- Can modify request/response
- Must call `next()` or send response

### Security
- Always use HTTPS
- HttpOnly cookies for web
- SecureStore for mobile
- Short token expiry
- Token rotation
- Never store tokens in URLs

### Platform Differences
- **Next.js**: HttpOnly cookies, middleware.ts, API routes
- **React Native**: SecureStore, headers only, background handling

---

## Additional Resources

- [JWT.io](https://jwt.io) - JWT debugger and information
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Expo SecureStore Docs](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

**End of Guide**

