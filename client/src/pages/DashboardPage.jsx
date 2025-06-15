import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import PetDisplay from '../components/PetDisplay.jsx';
import History from '../components/History.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import Streaks from '../components/Streaks.jsx';
import { githubAPI, petAPI } from '../utils/api';
import '../styles/pages/DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [loggingTime, setLoggingTime] = useState(false);
  const [timeForm, setTimeForm] = useState({ hours: '', description: '' });
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    // Remember the last active tab
    return localStorage.getItem('codepets_active_tab') || 'pet';
  });
  // Handle logout with navigation
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Save active tab to localStorage when it changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('codepets_active_tab', tab);
    // Clear any messages when switching tabs
    setMessage(null);
  };

  const handleSyncCommits = async () => {
    try {
      setSyncing(true);
      setMessage(null);
        const response = await githubAPI.syncCommits();
      setMessage({
        type: 'success',
        text: `Synced ${response.data.newCommits} new commits! Earned ${response.data.pointsEarned} points.`
      });
      
      // Trigger streak refresh
      window.dispatchEvent(new CustomEvent('streakUpdate'));
      
      // Refresh pet display
      window.location.reload();
    } catch (err) {
      console.error('Sync error:', err);
      setMessage({
        type: 'error',
        text: 'Failed to sync commits. Please try again.'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleLogTime = async (e) => {
    e.preventDefault();
    
    if (!timeForm.hours || timeForm.hours <= 0) {
      setMessage({ type: 'error', text: 'Please enter valid hours' });
      return;
    }

    try {
      setLoggingTime(true);
      setMessage(null);      const response = await petAPI.logTime(parseFloat(timeForm.hours), timeForm.description);
      setMessage({
        type: 'success',
        text: `Logged ${timeForm.hours} hours! Earned ${response.data.pointsEarned} points.`
      });
      setTimeForm({ hours: '', description: '' });
      
      // Trigger streak refresh
      window.dispatchEvent(new CustomEvent('streakUpdate'));
      
      // Refresh pet display
      window.location.reload();
    } catch (err) {
      console.error('Time log error:', err);      setMessage({
        type: 'error',
        text: 'Failed to log time. Please try again.'
      });
    } finally {
      setLoggingTime(false);
    }  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>CodePets Dashboard</h1>
        <div className="user-info">
          <img src={user.avatarUrl} alt={user.username} className="user-avatar" />
          <span className="username">{user.username}</span>
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span>
            Logout
          </button>
        </div>
      </header>      <main className="dashboard-content">        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'pet' ? 'active' : ''}`}
            onClick={() => handleTabChange('pet')}
          >
            🐱 Pet
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleTabChange('history')}
          >
            📊 History
          </button>
          <button 
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('leaderboard')}
          >
            🏆 Leaderboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'streaks' ? 'active' : ''}`}
            onClick={() => handleTabChange('streaks')}
          >
            🔥 Streaks
          </button>
        </div>{activeTab === 'pet' && (
          <div className="pet-tab-content">
            <section className="pet-section">
              <PetDisplay />
            </section>

            <section className="actions-section">
              <h3>Actions</h3>
              
              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}              <div className="action-card">
                <h4>🔄 Sync GitHub Commits</h4>
                <p>Fetch your latest commits and earn points for your pet!</p>                <button 
                  onClick={handleSyncCommits} 
                  disabled={syncing}
                  className="action-btn"
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>

              <div className="action-card">
                <h4>⏰ Log Coding Time</h4>
                <p>Manually log offline coding time to earn bonus points!</p>
                <form onSubmit={handleLogTime} className="time-form">
                  <div className="form-group">
                    <label htmlFor="hours">Hours:</label>
                    <input
                      type="number"
                      id="hours"
                      min="0.1"
                      max="24"
                      step="0.1"
                      value={timeForm.hours}
                      onChange={(e) => setTimeForm({ ...timeForm, hours: e.target.value })}
                      placeholder="e.g., 2.5"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description (optional):</label>
                    <input
                      type="text"
                      id="description"
                      value={timeForm.description}
                      onChange={(e) => setTimeForm({ ...timeForm, description: e.target.value })}
                      placeholder="What did you work on?"
                      maxLength="200"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loggingTime}
                    className="action-btn"
                  >
                    {loggingTime ? 'Logging...' : 'Log Time'}
                  </button>                </form>
              </div>
            </section>
          </div>
        )}        {activeTab === 'history' && (
          <div className="history-tab-section">
            <History />
          </div>
        )}        {activeTab === 'leaderboard' && (
          <div className="leaderboard-tab-section">
            <Leaderboard />
          </div>
        )}

        {activeTab === 'streaks' && (
          <div className="streaks-tab-section">
            <Streaks />
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
