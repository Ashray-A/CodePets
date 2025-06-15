import { useState, useEffect } from 'react';
import { streaksAPI } from '../utils/api';
import '../styles/components/Streaks.css';

const Streaks = () => {
  const [streakData, setStreakData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('personal'); // 'personal' or 'leaderboard'
  useEffect(() => {
    fetchStreakData();
    
    // Listen for streak updates from other components
    const handleStreakUpdate = () => {
      console.log('🔄 Refreshing streak data due to activity');
      fetchStreakData();
    };
    
    window.addEventListener('streakUpdate', handleStreakUpdate);
    
    return () => {
      window.removeEventListener('streakUpdate', handleStreakUpdate);
    };
  }, []);
  const fetchStreakData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching streak data...');
      
      // Fetch user's streak data
      const streakResponse = await streaksAPI.getStreak();
      console.log('🔍 Streak response:', streakResponse.data);
      setStreakData(streakResponse.data.streak);
      
      // Fetch streak leaderboard
      const leaderboardResponse = await streaksAPI.getLeaderboard(20);
      console.log('🔍 Leaderboard response:', leaderboardResponse.data);
      setLeaderboard(leaderboardResponse.data.leaderboard);
      
    } catch (error) {
      console.error('❌ Error fetching streak data:', error);
      console.error('❌ Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const formatLastActivity = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  const getStreakEmoji = (streak) => {
    if (streak === 0) return '❄️';
    if (streak < 7) return '🔥';
    if (streak < 30) return '🚀';
    if (streak < 100) return '⭐';
    return '👑';
  };

  const getStreakMessage = (streak) => {
    if (streak === 0) return "Start your coding streak today!";
    if (streak === 1) return "Great start! Keep it going!";
    if (streak < 7) return "You're on fire! 🔥";
    if (streak < 30) return "Amazing consistency! 🚀";
    if (streak < 100) return "You're a coding machine! ⭐";
    return "Legendary coder! 👑";
  };

  if (loading) {
    return (
      <div className="streaks-container">
        <div className="loading">
          <div className="fire-emoji">🔥</div>
          <p>Loading your streaks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="streaks-container">
      <div className="streaks-header">
        <h2>🔥 Coding Streaks</h2>
        <p>Keep coding every day to maintain your streak!</p>
      </div>

      <div className="view-tabs">
        <button 
          className={`tab-button ${activeView === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveView('personal')}
        >
          My Streak
        </button>
        <button 
          className={`tab-button ${activeView === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveView('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      {activeView === 'personal' ? (
        <div className="personal-streak">
          <div className="streak-card main-streak">
            <div className="streak-icon">
              {getStreakEmoji(streakData?.currentStreak || 0)}
            </div>
            <div className="streak-info">
              <div className="streak-number">
                {streakData?.currentStreak || 0}
              </div>
              <div className="streak-label">Current Streak</div>
              <div className="streak-message">
                {getStreakMessage(streakData?.currentStreak || 0)}
              </div>
            </div>
          </div>

          <div className="streak-stats">
            <div className="stat-card">
              <div className="stat-number">{streakData?.longestStreak || 0}</div>
              <div className="stat-label">Longest Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {formatLastActivity(streakData?.lastActivityDate)}
              </div>
              <div className="stat-label">Last Activity</div>
            </div>
          </div>

          <div className="streak-tips">
            <h3>💡 Tips to maintain your streak:</h3>
            <ul>
              <li>Make commits to your GitHub repositories</li>
              <li>Log your coding time in the app</li>
              <li>Code every day, even if just for a few minutes</li>
              <li>Set up reminders to help you stay consistent</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="streak-leaderboard">
          <h3>🏆 Top Streaks</h3>
          {leaderboard.length === 0 ? (
            <div className="empty-leaderboard">
              <p>No active streaks yet. Be the first!</p>
            </div>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.map((entry) => (
                <div key={entry.username} className="leaderboard-item">
                  <div className="rank">#{entry.rank}</div>
                  <img 
                    src={entry.avatarUrl} 
                    alt={entry.username} 
                    className="avatar"
                  />
                  <div className="user-info">
                    <div className="username">{entry.username}</div>
                    <div className="streak-info">
                      <span className="current-streak">
                        🔥 {entry.currentStreak} days
                      </span>
                      <span className="longest-streak">
                        (Best: {entry.longestStreak})
                      </span>
                    </div>
                  </div>
                  <div className="streak-badge">
                    {getStreakEmoji(entry.currentStreak)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Streaks;
