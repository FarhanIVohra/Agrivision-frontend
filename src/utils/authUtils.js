import { store } from '../store/store';
import { setUser, setToken } from '../store/authSlice';

// Helper function to decode JWT token
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Helper function to restore user from localStorage
export const restoreUserFromStorage = () => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('user');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && decoded.email) {
        // Create user object from decoded token
        const user = {
          name: decoded.name || decoded.username || 'User',
          email: decoded.email,
          phone: decoded.phone || '+91 0000000000',
        };
        store.dispatch(setUser(user));
        store.dispatch(setToken(token));
        return user;
      }
    }
  } catch (error) {
    console.error('Error restoring user from storage:', error);
  }
  return null;
};

// Helper function to get current user with fallback
export const getCurrentUser = () => {
  const state = store.getState();
  const reduxUser = state.auth.user;

  if (reduxUser) {
    return reduxUser;
  }

  // Try to restore from storage
  const restoredUser = restoreUserFromStorage();
  if (restoredUser) {
    return restoredUser;
  }

  // Fallback to guest user
  return {
    name: 'Guest User',
    email: 'guest@farm.com',
    phone: '+91 0000000000',
  };
};
