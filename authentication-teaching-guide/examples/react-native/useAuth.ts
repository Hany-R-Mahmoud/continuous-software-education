/**
 * React Native Authentication Hook
 * 
 * This example shows how to create a custom hook for
 * managing authentication state in React Native.
 */

import { useState, useEffect, useCallback } from 'react';
import { getAccessToken, clearTokens } from './secure-storage';
import apiClient from './api-client';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
}

/**
 * Custom hook for authentication
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false,
  });
  
  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback(async () => {
    try {
      const token = await getAccessToken();
      
      if (!token) {
        setAuthState({
          user: null,
          loading: false,
          authenticated: false,
        });
        return;
      }
      
      // Verify token by fetching user profile
      const response = await apiClient.get('/api/user/profile');
      
      setAuthState({
        user: response.data.user,
        loading: false,
        authenticated: true,
      });
    } catch (error) {
      // Token invalid or expired
      await clearTokens();
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      });
    }
  }, []);
  
  /**
   * Login function
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });
      
      const { accessToken, refreshToken } = response.data;
      await storeTokens(accessToken, refreshToken);
      
      // Refresh auth state
      await checkAuth();
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  }, [checkAuth]);
  
  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      // Optionally notify server
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Even if server call fails, clear local tokens
      console.error('Logout error:', error);
    } finally {
      await clearTokens();
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
      });
    }
  }, []);
  
  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}

/**
 * Usage example:
 * 
 * import { useAuth } from '@/hooks/useAuth';
 * 
 * function MyComponent() {
 *   const { user, loading, authenticated, login, logout } = useAuth();
 *   
 *   if (loading) return <LoadingScreen />;
 *   if (!authenticated) return <LoginScreen onLogin={login} />;
 *   
 *   return (
 *     <View>
 *       <Text>Welcome, {user?.email}</Text>
 *       <Button onPress={logout} title="Logout" />
 *     </View>
 *   );
 * }
 */

