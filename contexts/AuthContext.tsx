/**
 * Authentication Context
 * Provides authentication state and methods to the entire application
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  walletAddress: string | null;
  nftHolder: boolean;
  role: 'user' | 'staff' | 'admin';
  avatarUrl: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'citizenspace_access_token';
const REFRESH_TOKEN_KEY = 'citizenspace_refresh_token';
const USER_KEY = 'citizenspace_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth data from localStorage on mount
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedRefreshToken && storedUser) {
          setAccessToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Save auth data to localStorage
  const saveAuthData = useCallback((token: string, refresh: string, userData: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setAccessToken(token);
    setRefreshToken(refresh);
    setUser(userData);
  }, []);

  // Clear auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      saveAuthData(data.data.accessToken, data.data.refreshToken, data.data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [saveAuthData]);

  // Register function
  const register = useCallback(async (
    email: string,
    password: string,
    fullName?: string,
    phone?: string
  ) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      saveAuthData(data.data.accessToken, data.data.refreshToken, data.data.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, [saveAuthData]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  }, [accessToken, clearAuthData]);

  // Update profile function
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Update failed');
      }

      setUser(result.data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(result.data.user));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }, [accessToken]);

  // Refresh access token
  const refreshAccessToken = useCallback(async () => {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      const newAccessToken = data.data.accessToken;
      localStorage.setItem(TOKEN_KEY, newAccessToken);
      setAccessToken(newAccessToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthData();
      throw error;
    }
  }, [refreshToken, clearAuthData]);

  // Auto-refresh token before expiry (every 10 minutes)
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const interval = setInterval(() => {
      refreshAccessToken().catch(console.error);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [accessToken, refreshToken, refreshAccessToken]);

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    register,
    logout,
    updateProfile,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}