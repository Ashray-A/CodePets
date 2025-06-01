import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Check for existing auth token on app load
    const token = localStorage.getItem('codepets_token');
    const userData = localStorage.getItem('codepets_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('codepets_token');
        localStorage.removeItem('codepets_user');
      }
    }
    setIsLoading(false);
  }, []);
  const handleGitHubCallback = async (code, state) => {
    try {
      // Send the authorization code to the backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('GitHub authentication failed');
      }      const data = await response.json();
      
      localStorage.setItem('codepets_token', data.token);
      localStorage.setItem('codepets_user', JSON.stringify(data.user));
      setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('GitHub callback error:', error);
      throw error;
    }
  };
  const loginWithGitHub = () => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'user:email read:user repo';
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${Math.random().toString(36)}`;
    
    window.location.href = githubAuthUrl;
  };
  const logout = () => {
    localStorage.removeItem('codepets_token');
    localStorage.removeItem('codepets_user');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    loginWithGitHub,
    handleGitHubCallback,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};