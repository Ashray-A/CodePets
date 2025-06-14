import { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.getLeaderboard();
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getLevelName = (level) => {
    switch (level) {
      case 1: return 'Baby Cat';
      case 2: return 'Young Cat';
      case 3: return 'Adult Cat';
      case 4: return 'Wise Cat';
      case 5: return 'Master Cat';
      default: return 'Baby Cat';
    }
  };

  const getCatEmoji = (level) => {
    switch (level) {
      case 1: return '🐱';
      case 2: return '🐈';
      case 3: return '😸';
      case 4: return '😺';
      case 5: return '👑🐱';
      default: return '🐱';
    }
  };

  if (loading) return <div className="leaderboard-loading">Loading leaderboard... 📊</div>;
  if (error) return <div className="leaderboard-error">{error}</div>;

  return (
    <div className="leaderboard-content">
      <div className="leaderboard-header">
        <h2>🏆 Leaderboard</h2>
        <p>Top coding pet trainers</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="no-data">No users found</div>
      ) : (        <div className="leaderboard-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Pet & Level</th>
                <th>Points</th>
                <th>Commits</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user) => (
                <tr key={user.username} className={`rank-${user.rank <= 3 ? user.rank : 'other'}`}>                  <td className="rank-cell">
                    <span className="rank-number">
                      {user.rank === 1 ? '🥇' : 
                       user.rank === 2 ? '🥈' : 
                       user.rank === 3 ? '🥉' : 
                       `#${user.rank}`}
                    </span>
                  </td>
                  <td className="user-cell">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className="user-avatar-small"
                    />
                    <span className="username">{user.username}</span>
                  </td>                  <td className="pet-cell">
                    <div className="pet-info">
                      <div className="pet-main">
                        <span className="pet-emoji">{getCatEmoji(user.level)}</span>
                        <span className="pet-name">{user.petName}</span>
                      </div>
                      <div className="pet-level">
                        <small>Level {user.level} - {getLevelName(user.level)}</small>
                      </div>
                    </div>
                  </td>
                  <td className="points-cell">
                    <strong>{user.totalPoints}</strong>
                  </td>
                  <td className="commits-cell">
                    {user.totalCommits}
                  </td>
                  <td className="hours-cell">
                    {user.totalHours}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
