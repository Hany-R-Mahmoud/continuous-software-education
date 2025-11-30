# Module 6: Backend Token Management

> **Backend Token Management**

---


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

## Related Visuals

### Infographics

![Backend Token Management](infographic.jpg)

### Diagrams

![Backend Token Management Diagram](diagram.png)

---

## Navigation

- [← Previous: Frontend Token Management](../05-frontend-token-management/05-frontend-token-management.md)
- [↑ Back to README](../../README.md)
- [Next: Complete Implementation Examples →](../07-complete-implementation-examples/07-complete-implementation-examples.md)
