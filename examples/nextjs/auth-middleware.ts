/**
 * Next.js Authentication Middleware
 * 
 * This example shows how to create reusable authentication middleware
 * for Next.js API routes.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware wrapper that validates JWT token and attaches user to request
 */
export function authenticateToken(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
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

/**
 * Usage example:
 * 
 * // pages/api/protected/route.ts
 * import { authenticateToken, AuthenticatedRequest } from '@/lib/auth-middleware';
 * 
 * export default authenticateToken(async (req: AuthenticatedRequest, res) => {
 *   // req.user is now available and typed!
 *   res.json({ 
 *     message: 'Protected data',
 *     user: req.user,
 *   });
 * });
 */

