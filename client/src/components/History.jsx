import { useState, useEffect, useCallback } from 'react';
import { petAPI } from '../utils/api';
import '../styles/components/History.css';

const History = () => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearAuthAndRedirect = () => {
    localStorage.removeItem("codepets_token");
    localStorage.removeItem("codepets_user");
    window.location.href = "/login";
  };
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching history...');
      
      // Check if we have a valid token
      const token = localStorage.getItem("codepets_token");
      if (!token) {
        throw new Error("No authentication token found");
      }
        const response = await petAPI.getHistory();
      console.log('History response:', response);
      // Extract the actual data from the response
      setHistoryData(response.data.data);    } catch (error) {
      console.error('History fetch error:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || '';
        
        // Only redirect for actual token issues, not GitHub API problems
        if (message.includes('Invalid token') || 
            message.includes('Token expired') || 
            message.includes('Access token required')) {
          setError("Your session has expired. Please login again.");
          setTimeout(() => {
            clearAuthAndRedirect();
          }, 3000);
        } else {
          setError("Authentication issue with GitHub. Please try again or re-login if the problem persists.");
        }
      } else {
        setError(`Failed to load history: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Debug: Log current auth state
  useEffect(() => {
    const token = localStorage.getItem("codepets_token");
    const user = localStorage.getItem("codepets_user");
    console.log("History component auth state:", {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenStart: token?.substring(0, 10),
      hasUser: !!user
    });
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };  if (loading) return <div className="history-loading">Loading history... 📊</div>;
  if (error) return (
    <div className="history-error">
      <h3>⚠️ Unable to load history</h3>
      <p>{error}</p>
      <div>
        <button onClick={fetchHistory} className="retry-btn">🔄 Try Again</button>
        {error.includes("Authentication failed") && (
          <button onClick={clearAuthAndRedirect} className="retry-btn" style={{ marginLeft: '1rem', background: '#ef4444' }}>
            🚪 Login Again
          </button>
        )}
      </div>
    </div>
  );
  if (!historyData) return (
    <div className="history-error">
      <h3>No history data found</h3>
      <p>Start by syncing your commits or logging some time!</p>
    </div>
  );
  return (
    <div className="history-content">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>📈 Total Activity</h4>
          <div className="stat-item">
            <span>Total Commits:</span>
            <strong>{historyData?.stats?.totalCommits || 0}</strong>
          </div>
          <div className="stat-item">
            <span>Total Hours:</span>
            <strong>{historyData?.stats?.totalHours || 0}</strong>
          </div>
          <div className="stat-item">
            <span>Total Points:</span>
            <strong>{historyData?.stats?.totalPoints || 0}</strong>
          </div>
        </div>

        <div className="stat-card">
          <h4>🎯 Points Breakdown</h4>
          <div className="stat-item">
            <span>Commit Points:</span>
            <strong>{historyData?.stats?.commitPoints || 0}</strong>
          </div>
          <div className="stat-item">
            <span>Time Points:</span>
            <strong>{historyData?.stats?.timePoints || 0}</strong>          </div>
          <div className="stat-item">
            <span>Current Level:</span>
            <strong>Level {historyData?.stats?.level || 1}</strong>
          </div>
        </div>

        <div className="stat-card">
          <h4>📅 Recent Activity</h4>
          <div className="stat-item">
            <span>This Week:</span>
            <strong>{historyData?.stats?.thisWeek?.hours || 0}h, {historyData?.stats?.thisWeek?.commits || 0} commits</strong>
          </div>
          <div className="stat-item">
            <span>Last Sync:</span>
            <strong>{historyData?.stats?.lastSync ? formatDate(historyData.stats.lastSync) : 'Never'}</strong>
          </div>
          <div className="stat-item">
            <span>Last Activity:</span>
            <strong>{historyData?.stats?.lastActivity ? formatDate(historyData.stats.lastActivity) : 'Never'}</strong>
          </div>
        </div>
      </div>        {/* Recent Time Logs */}
        <div className="history-section">
          <h4>⏰ Recent Time Logs</h4>
          {historyData?.timeLogs && historyData.timeLogs.length > 0 ? (
            <div className="history-list">
              {historyData.timeLogs.map((log, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">{formatDate(log.date)}</div>
                  <div className="history-details">
                    <strong>{log.hours} hours</strong>
                    {log.description && <span> - {log.description}</span>}
                  </div>
                  <div className="history-points">+{log.points} pts</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No time logs yet. Start logging your coding time!</p>
          )}
        </div>        {/* Recent Commit Syncs */}
        <div className="history-section">
          <h4>🔄 Recent Commit Syncs</h4>
          {historyData?.commitHistory && historyData.commitHistory.length > 0 ? (
            <div className="history-list">
              {historyData.commitHistory.map((sync, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">{formatDate(sync.date)}</div>
                  <div className="history-details">
                    <strong>{sync.newCommits} new commits</strong>
                  </div>
                  <div className="history-points">+{sync.pointsEarned} pts</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No commit syncs yet. Sync your GitHub commits to see history!</p>
          )}
        </div>
    </div>
  );
};

export default History;
