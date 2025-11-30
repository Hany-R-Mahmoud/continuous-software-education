/**
 * Next.js Token Storage Utility
 * 
 * This example shows how to securely store and manage tokens in Next.js
 * using HttpOnly cookies for maximum security.
 */

import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Store access and refresh tokens in HttpOnly cookies
 */
export async function storeTokens(accessToken: string, refreshToken: string) {
  cookies().set(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true, // Not accessible to JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: 900, // 15 minutes
    path: '/',
  });
  
  cookies().set(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 604800, // 7 days
    path: '/',
  });
}

/**
 * Get access token from cookies
 */
export async function getAccessToken(): Promise<string | null> {
  return cookies().get(ACCESS_TOKEN_KEY)?.value || null;
}

/**
 * Get refresh token from cookies
 */
export async function getRefreshToken(): Promise<string | null> {
  return cookies().get(REFRESH_TOKEN_KEY)?.value || null;
}

/**
 * Clear all authentication tokens
 */
export async function clearTokens() {
  cookies().delete(ACCESS_TOKEN_KEY);
  cookies().delete(REFRESH_TOKEN_KEY);
}

/**
 * Check if user has a valid access token
 */
export async function hasValidToken(): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;
  
  try {
    // Decode token to check expiry (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() < exp;
  } catch {
    return false;
  }
}

