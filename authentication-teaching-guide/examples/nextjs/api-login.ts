/**
 * Next.js API Route - Login Endpoint
 * 
 * This example shows a complete login implementation
 * for Next.js App Router (app/api/auth/login/route.ts)
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storeTokens } from '@/lib/token-storage';

const JWT_SECRET = process.env.JWT_SECRET!;

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body: LoginRequest = await request.json();
    const { email, password } = body;
    
    // 2. Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // 3. Find user (replace with your database query)
    // const user = await User.findOne({ email });
    // For this example, using mock data
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      hashedPassword: '$2a$10$...', // Hashed password from database
      role: 'user',
    };
    
    // 4. Verify password
    const isValidPassword = await bcrypt.compare(password, mockUser.hashedPassword);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // 5. Generate tokens
    const accessToken = jwt.sign(
      {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      {
        sub: mockUser.id,
        type: 'refresh',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 6. Store tokens in HttpOnly cookies
    await storeTokens(accessToken, refreshToken);
    
    // 7. Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Usage from client:
 * 
 * const response = await fetch('/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email, password }),
 * });
 * 
 * if (response.ok) {
 *   // Tokens are stored in HttpOnly cookies automatically
 *   router.push('/dashboard');
 * }
 */

