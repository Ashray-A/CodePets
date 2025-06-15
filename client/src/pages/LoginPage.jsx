import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { authAPI } from '../utils/api';
import '../styles/pages/LoginPage.css';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const oauthProcessingRef = useRef(false);
  const { login, clearAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Clear any stale auth data when login page loads (unless we're handling a callback)
  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      clearAuth();
    }
  }, [clearAuth, searchParams]);

  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      clearAuth();
      const response = await authAPI.getGitHubUrl();
      if (!response.data.success || !response.data.url) {
        throw new Error('Invalid response from server');
      }
      localStorage.setItem('oauth_start_time', Date.now().toString());
      window.location.href = response.data.url;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to initiate GitHub login';
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Handle GitHub OAuth callback
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    if (error) {
      setError(`GitHub authentication failed: ${error}`);
      clearAuth();
      return;
    }
    if (code && !oauthProcessingRef.current) {
      oauthProcessingRef.current = true;
      const handleGitHubCallback = async (code) => {
        try {
          setLoading(true);
          setError(null);
          const startTime = localStorage.getItem('oauth_start_time');
          if (startTime) {
            localStorage.removeItem('oauth_start_time');
          }
          const response = await authAPI.authenticateWithGitHub(code);
          if (!response.data.success) {
            throw new Error(response.data.message || 'Authentication failed');
          }
          const { token, user } = response.data;
          if (!token || !user) {
            throw new Error('Invalid response: missing token or user data');
          }
          login(token, user);
          navigate('/dashboard');
        } catch (err) {
          oauthProcessingRef.current = false;
          let errorMessage = 'Authentication failed. Please try again.';
          if (err.response?.status === 400) {
            const serverMessage = err.response.data?.message;
            if (serverMessage?.includes('expired') || serverMessage?.includes('invalid')) {
              errorMessage = 'Your login session expired or the authorization code was already used. Please click "Login with GitHub" to try again.';
            } else if (serverMessage) {
              errorMessage = serverMessage;
            }
          } else if (err.response?.status === 500) {
            errorMessage = 'Server error during authentication. Please try again in a moment.';
          } else if (err.code === 'NETWORK_ERROR' || !err.response) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          }
          setError(errorMessage);
          clearAuth();
          setLoading(false);
          navigate('/login', { replace: true });
        }
      };
      handleGitHubCallback(code);
    }
  }, [searchParams, login, navigate, clearAuth]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="header-section">
          <div className="logo-container">
            <div className="logo-icon">🐱</div>
            <h1>CodePets</h1>
          </div>
          <p className="tagline">Grow your digital pet through coding! 🐾</p>
        </div>
        <div className="login-content">
          <div className="pet-preview">
            <div className="pet-animation">
              <span className="preview-emoji">😸</span>
              <div className="pulse-ring"></div>
            </div>
            <p className="preview-text">Your coding companion awaits!</p>
          </div>
          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <div className="error-title">{error}</div>
                {(error.includes('expired') || error.includes('already used')) && (
                  <div className="error-tips">
                    <strong>💡 Quick fixes:</strong>
                    <ul>
                      <li>Authorization codes expire after 10 minutes</li>
                      <li>Each code can only be used once</li>
                      <li>Complete the GitHub login process quickly</li>
                      <li>Don't refresh or go back during login</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          <button 
            onClick={handleGitHubLogin} 
            disabled={loading}
            className="github-login-btn enhanced-github-btn"
            aria-label="Login with GitHub"
          >
            <div className="btn-content">
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span className="github-icon-circle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#fff"/>
                      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48C19.13 20.54 22 16.74 22 12.26 22 6.58 17.52 2 12 2Z" fill="#24292f"/>
                    </svg>
                  </span>
                  <span className="github-btn-text">Login with GitHub</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </div>
          </button>
          <div className="features">
            <h3>How it works:</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">🔗</span>
                <span>Connect your GitHub account</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Your commits earn points for your pet</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⏰</span>
                <span>Log coding time for bonus points</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Watch your pet grow through 5 levels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
