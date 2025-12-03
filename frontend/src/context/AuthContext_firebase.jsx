/**
 * Auth Context - JWT Version
 * Global authentication state management
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken, removeToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      const token = getToken();
      
      if (token) {
        try {
          const data = await authAPI.getProfile();
          setCurrentUser(data.user);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          removeToken();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      const data = await authAPI.register({
        email,
        password,
        displayName
      });
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    authAPI.logout();
    setCurrentUser(null);
  };

  const updateUserProfile = async (updates) => {
    try {
      const data = await authAPI.updateProfile(updates);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
