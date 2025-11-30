/**
 * Express Authentication Routes
 * 
 * This example shows complete authentication endpoints:
 * - Login
 * - Refresh token
 * - Logout
 */

import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateTokens, verifyRefreshToken } from './token-utils';
import { authenticateToken } from './auth-middleware';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login endpoint
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // 2. Find user (replace with your database query)
    // const user = await User.findOne({ email });
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      hashedPassword: '$2a$10$...', // From database
      role: 'user',
      tokenVersion: 0,
    };
    
    // 3. Verify password
    const isValid = await bcrypt.compare(password, mockUser.hashedPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 4. Generate tokens
    const { accessToken, refreshToken } = generateTokens(mockUser);
    
    // 5. Optionally store refresh token in database (for rotation)
    // await storeRefreshToken(mockUser.id, refreshToken);
    
    // 6. Return tokens
    res.json({
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }
    
    // 1. Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // 2. Check if token was revoked (if using rotation)
    // const storedToken = await getStoredRefreshToken(decoded.sub);
    // if (!storedToken || storedToken !== refreshToken) {
    //   return res.status(401).json({ error: 'Invalid refresh token' });
    // }
    
    // 3. Get user (replace with your database query)
    // const user = await User.findById(decoded.sub);
    const mockUser = {
      id: decoded.sub,
      email: 'user@example.com',
      role: 'user',
      tokenVersion: decoded.tokenVersion,
    };
    
    // 4. Check token version (for rotation/revocation)
    // if (user.tokenVersion !== decoded.tokenVersion) {
    //   return res.status(401).json({ error: 'Token invalidated' });
    // }
    
    // 5. Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(mockUser);
    
    // 6. Update stored refresh token (rotation)
    // await updateRefreshToken(mockUser.id, newRefreshToken);
    
    // 7. Return new tokens
    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('expired')) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint (requires authentication)
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user!.id;
    
    // Revoke refresh token (if using rotation)
    // await revokeRefreshToken(userId, refreshToken);
    
    // Optionally increment token version to invalidate all tokens
    // await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user (requires authentication)
 */
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;

/**
 * Usage in main app:
 * 
 * import authRoutes from './routes/auth';
 * app.use('/api/auth', authRoutes);
 */

