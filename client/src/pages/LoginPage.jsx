import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { authAPI } from '../utils/api';

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
  }, [clearAuth, searchParams]);  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear any existing auth data before starting new login
      clearAuth();

      console.log('🔄 Initiating GitHub OAuth flow...');
      const response = await authAPI.getGitHubUrl();
      
      if (!response.data.success || !response.data.url) {
        throw new Error('Invalid response from server');
      }
      
      console.log('✅ OAuth URL received, redirecting to GitHub...');
      
      // Add timestamp to track OAuth timing
      localStorage.setItem('oauth_start_time', Date.now().toString());
      
      window.location.href = response.data.url;
      
    } catch (err) {
      console.error('Login initiation error:', err);
      
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
      console.error('❌ GitHub OAuth error:', error);
      setError(`GitHub authentication failed: ${error}`);
      clearAuth();
      return;
    }
    
    if (code && !oauthProcessingRef.current) {
      console.log('🔄 LoginPage: OAuth callback detected, processing code...');
      oauthProcessingRef.current = true; // Prevent multiple processing
      
      const handleGitHubCallback = async (code) => {
        try {
          setLoading(true);
          setError(null);
          
          // Check OAuth timing
          const startTime = localStorage.getItem('oauth_start_time');
          if (startTime) {
            const elapsedMinutes = (Date.now() - parseInt(startTime)) / (1000 * 60);
            console.log(`⏱️ OAuth elapsed time: ${elapsedMinutes.toFixed(1)} minutes`);
            localStorage.removeItem('oauth_start_time');
            
            if (elapsedMinutes > 9) {
              console.log('⚠️ OAuth flow took longer than 9 minutes - code may be expired');
            }
          }
          
          console.log('🔄 Processing OAuth callback...');
          const response = await authAPI.authenticateWithGitHub(code);
          
          if (!response.data.success) {
            throw new Error(response.data.message || 'Authentication failed');
          }
          
          const { token, user } = response.data;
          
          if (!token || !user) {
            throw new Error('Invalid response: missing token or user data');
          }
          
          console.log('✅ OAuth successful, logging in user...');
          login(token, user);
          navigate('/dashboard');
          
        } catch (err) {
          console.error('Auth error:', err);
          
          // Reset processing flag on error
          oauthProcessingRef.current = false;
          
          // Provide specific error messages based on the error type
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
          
          // Clear any cached auth data on failed login
          clearAuth();
          setLoading(false);
          
          // Clear URL params to prevent retry loops
          navigate('/login', { replace: true });
        }
      };
      
      handleGitHubCallback(code);
    }
  }, [searchParams, login, navigate, clearAuth]);

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>CodePets</h1>
        <p className="tagline">Grow your digital pet through coding! 🐱</p>
        
        <div className="login-content">
          <div className="pet-preview">
            <span className="preview-emoji">🐱</span>
            <p>Your coding companion awaits!</p>
          </div>

          {error && (
            <div className="error-message" style={{
              background: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #f88',
              marginBottom: '15px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ⚠️ {error}
              {(error.includes('expired') || error.includes('already used')) && (
                <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'normal', lineHeight: '1.4' }}>
                  <strong>💡 Common solutions:</strong><br/>
                  • Authorization codes expire after 10 minutes<br/>
                  • Each code can only be used once<br/>
                  • Complete the GitHub login process quickly<br/>
                  • Don't refresh or go back during login
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handleGitHubLogin} 
            disabled={loading}
            className="github-login-btn"
          >
            {loading ? (
              'Connecting...'
            ) : (
              <>
                <span className="github-icon">🐙</span>
                Login with GitHub
              </>
            )}
          </button>

          <div className="features">
            <h3>How it works:</h3>
            <ul>
              <li>🔗 Connect your GitHub account</li>
              <li>📊 Your commits earn points for your pet</li>
              <li>⏰ Log coding time for bonus points</li>
              <li>🎯 Watch your pet grow through 5 levels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
