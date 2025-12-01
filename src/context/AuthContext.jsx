import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser as setReduxUser, setToken as setReduxToken, logout as reduxLogout } from '../store/slices/authSlice';
// Get backend URL from environment variable and normalize (remove trailing slash)
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userProfile = localStorage.getItem('userProfile');
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';

        if (token && userProfile && isAuth) {
          const parsedUser = JSON.parse(userProfile);
          
          // Validate token with backend
          const isValid = await validateTokenWithBackend(token);
          
          if (isValid) {
            setUser(parsedUser);
            setAuthToken(token);
            setIsAuthenticated(true);
          } else {
            clearAuthData();
          }
        } else {
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

  // Validate token with backend
  const validateTokenWithBackend = async (token) => {
    try {
  const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // Clear all auth data
  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userEmail');
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userProfile', JSON.stringify(data.user));
        localStorage.setItem('userEmail', email);
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        setUser(data.user);
        setAuthToken(data.access_token);
        setIsAuthenticated(true);
        dispatch(setReduxUser(data.user));
        dispatch(setReduxToken(data.access_token));
        
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userProfile', JSON.stringify(data.user));
        localStorage.setItem('userEmail', userData.email);
        
        setUser(data.user);
        setAuthToken(data.access_token);
        setIsAuthenticated(true);
        
        return true;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear local storage and redux state
    clearAuthData();
    try {
      dispatch(reduxLogout());
    } catch (e) {
      // ignore if dispatch not available
    }
    navigate('/login');
  };

  // Make authenticated API request
  const makeAuthenticatedRequest = async (url, options = {}) => {
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
  };

  // Check if user has specific permission (for future use)
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const value = {
    user,
    authToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    makeAuthenticatedRequest,
    hasPermission,
    clearAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;