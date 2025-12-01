import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Backend URL from environment (Vite) - normalize to avoid double slashes
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userProfile = localStorage.getItem('userProfile');
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';

        if (token && userProfile && isAuth) {
          const parsedUser = JSON.parse(userProfile);
          setUser(parsedUser);
          setAuthToken(token);
          setIsAuthenticated(true);
        } else {
          // Clear any partial auth data
          clearAuthData();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Clear all auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userEmail');
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
  }, []);

  // Login function
  const login = useCallback((userData, token) => {
    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userProfile', JSON.stringify(userData));
      localStorage.setItem('userEmail', userData.email);
      
      setUser(userData);
      setAuthToken(token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearAuthData();
    navigate('/login');
  }, [clearAuthData, navigate]);

  // Validate token with backend
  const validateToken = useCallback(async () => {
    if (!authToken) return false;

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return true;
      } else if (response.status === 401) {
        // Token expired
        logout();
        return false;
      } else {
        // Other error, assume valid for now
        return true;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      // Network error, assume valid to avoid blocking user
      return true;
    }
  }, [authToken, logout]);

  // Make authenticated API request
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    if (!authToken) {
      throw new Error('No authentication token available');
    }

    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired
      logout();
      throw new Error('Authentication expired');
    }

    return response;
  }, [authToken, logout]);

  return {
    user,
    authToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    validateToken,
    makeAuthenticatedRequest,
    clearAuthData
  };
};

export default useAuth;