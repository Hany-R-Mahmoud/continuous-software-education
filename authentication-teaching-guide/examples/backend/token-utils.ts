/**
 * Token Generation and Validation Utilities
 * 
 * This example shows how to generate and validate JWT tokens
 * for authentication.
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

interface User {
  id: string;
  email: string;
  role: string;
  tokenVersion?: number;
}

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

/**
 * Generate access token
 */
export function generateAccessToken(user: User): string {
  const payload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(user: User): string {
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    sub: user.id,
    tokenVersion: user.tokenVersion || 0,
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Generate both tokens
 */
export function generateTokens(user: User): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
}

/**
 * Decode token without verification (for checking expiry)
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) return true;
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpirationTime(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    return decoded?.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Usage example:
 * 
 * // On login
 * const { accessToken, refreshToken } = generateTokens(user);
 * 
 * // Verify token in middleware
 * try {
 *   const decoded = verifyAccessToken(token);
 *   // Use decoded.userId, decoded.email, etc.
 * } catch (error) {
 *   // Token invalid or expired
 * }
 */

