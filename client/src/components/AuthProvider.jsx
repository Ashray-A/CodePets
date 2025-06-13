import { useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
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
    
    // Force redirect to login page to ensure clean state
    window.location.href = '/login';
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
