# Module 4: Middleware Deep Dive

> **Understanding middleware, its execution flow, and implementation in Next.js and Express**

---

## What is Middleware?

**Definition**: Middleware is code that runs between a request and response. It can:
- Modify the request/response
- Execute additional logic
- Terminate the request early
- Pass control to the next middleware

**Analogy**: Like security checkpoints at an airport - each checkpoint (middleware) checks something before you proceed.

## Why Do We Need Middleware?

1. **Separation of Concerns**: Keep authentication logic separate from business logic
2. **Reusability**: Write once, use in multiple routes
3. **Security**: Centralized authentication/authorization
4. **Request Processing**: Logging, validation, transformation
5. **Error Handling**: Centralized error responses

## Middleware Execution Flow

```
Request → Middleware 1 → Middleware 2 → Middleware 3 → Route Handler → Response
           ↓              ↓              ↓
        Can modify    Can modify    Can modify
        Can stop      Can stop      Can stop
```

## Next.js Middleware

### File-based Middleware (`middleware.ts`)

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

### Next.js API Route Middleware

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

## Express Middleware

### Basic Auth Middleware

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

### Authorization Middleware

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

## Middleware Chain and Execution Order

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

## Error Handling in Middleware

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

## TypeScript Middleware Patterns

### Type-Safe Middleware Factory

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

### Generic Middleware with Type Parameters

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

## Key Takeaways: Middleware

1. **Middleware runs in order** - Define carefully
2. **Call `next()`** - Or request hangs
3. **Error handling** - Use try/catch or error middleware
4. **Type safety** - Extend Request type for TypeScript
5. **Reusability** - Create middleware functions, not inline code
6. **Separation** - Keep auth/validation separate from business logic

---

## Related Visuals

### Infographics

![Middleware Execution Flow](infographic.jpg)

### Diagrams

![Middleware Chain Diagram](diagram.png)

---

## Navigation

- [← Previous: Authentication Flows](../03-authentication-flows/03-authentication-flows.md)
- [↑ Back to README](../../README.md)
- [Next: Frontend Token Management →](../05-frontend-token-management/05-frontend-token-management.md)

