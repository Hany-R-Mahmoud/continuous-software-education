/**
 * Express Authentication Middleware
 * 
 * This example shows how to create reusable authentication middleware
 * for Express.js that validates JWT tokens.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// Extend Express Request type for TypeScript
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

/**
 * Middleware to authenticate JWT tokens
 * Attaches user to request if token is valid
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
      role: string;
    };
    
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

/**
 * Middleware to require specific roles
 * Must be used after authenticateToken
 */
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

/**
 * Usage examples:
 * 
 * // Single route
 * app.get('/api/protected', authenticateToken, (req, res) => {
 *   res.json({ user: req.user });
 * });
 * 
 * // With role requirement
 * app.get('/api/admin', 
 *   authenticateToken,
 *   requireRole('admin'),
 *   (req, res) => {
 *     res.json({ message: 'Admin only' });
 *   }
 * );
 * 
 * // Apply to all routes in a router
 * const protectedRouter = express.Router();
 * protectedRouter.use(authenticateToken);
 * 
 * protectedRouter.get('/profile', (req, res) => {
 *   res.json({ user: req.user });
 * });
 */

