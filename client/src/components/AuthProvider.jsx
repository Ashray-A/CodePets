import { useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage if available
    try {
      const userData = localStorage.getItem('codepets_user');
      const token = localStorage.getItem('codepets_token');
      if (userData && token) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem('codepets_user');
      localStorage.removeItem('codepets_token');
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Validate existing auth on mount by checking with server
    const validateAuthToken = async () => {
      const token = localStorage.getItem('codepets_token');
      const userData = localStorage.getItem('codepets_user');
      
      if (!token || !userData) {
        setLoading(false);
        return;
      }

      try {
        // Validate token with server by making an authenticated request
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
          (import.meta.env.PROD ? "https://codepets-server.onrender.com/api" : "http://localhost:5000/api");
        
        console.log('🔍 Auth: Validating token with API:', API_BASE_URL);
        
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Token is valid, set user as authenticated
          const validUserData = JSON.parse(userData);
          setUser(validUserData);
          console.log('✅ Auth: Token validated successfully');
        } else {
          // Token is invalid, clear auth data
          console.log('❌ Auth: Token validation failed, clearing auth data');
          localStorage.removeItem('codepets_token');
          localStorage.removeItem('codepets_user');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        // On error, clear potentially invalid auth data
        localStorage.removeItem('codepets_token');
        localStorage.removeItem('codepets_user');
        setUser(null);
      }
      
      setLoading(false);
    };

    validateAuthToken();
  }, []);

  // Handle page visibility changes to refresh auth state
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Page became visible and user is logged in, validate token
        const token = localStorage.getItem('codepets_token');
        if (!token) {
          // Token was removed while page was hidden
          setUser(null);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const login = async (token, userData) => {
    setAuthLoading(true);
    try {
      localStorage.setItem('codepets_token', token);
      localStorage.setItem('codepets_user', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ Auth: User logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setAuthLoading(true);
    console.log('🚪 Auth: Logging out user');
    localStorage.removeItem('codepets_token');
    localStorage.removeItem('codepets_user');
    setUser(null);
    setAuthLoading(false);
    
    // Use React Router navigation instead of window.location
    // The component using this should handle navigation
  };

  const clearAuth = () => {
    setAuthLoading(true);
    localStorage.removeItem('codepets_token');
    localStorage.removeItem('codepets_user');
    setUser(null);
    setAuthLoading(false);
  };

  const value = {
    user,
    login,
    logout,
    clearAuth,
    loading,
    authLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
