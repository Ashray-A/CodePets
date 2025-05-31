import React, { useState, useEffect } from 'react';
import Pet from './Pet';
import TimeLogger from './TimeLogger';
import GitHubSync from './GitHubSync';
import { activityAPI } from '../services/api';
import './OverviewTab.css';

const OverviewTab = ({ pet, onActivityLogged }) => {
  const [todayStats, setTodayStats] = useState({
    commits: 0,
    codingTime: 0,
    totalXP: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);  // Fetch today's statistics from the backend
  const fetchTodayStats = async () => {
    try {
      setIsLoading(true);
      const response = await activityAPI.getTodayStats();
      const stats = response.data;
      
      setTodayStats({
        commits: stats.commits || 0,
        codingTime: stats.codingTime || 0,
        totalXP: stats.totalXP || 0
      });
    } catch (error) {
      console.error('Error fetching today\'s stats:', error);
      // Keep existing values on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStats();
  }, []);

  // Update stats when activities are logged
  useEffect(() => {
    fetchTodayStats();
  }, [pet?.experience]); // Refetch when pet experience changes (indicates new activity)

  const formatCodingTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleActivityLogged = async (activity) => {
    // Refresh today's stats when activity is logged
    await fetchTodayStats();
    
    // Call the parent callback
    if (onActivityLogged) {
      onActivityLogged(activity);
    }
  };

  const handleGitHubSyncComplete = async (result) => {
    // Refresh today's stats when GitHub sync completes
    await fetchTodayStats();
    
    // Call the parent callback
    if (onActivityLogged) {
      onActivityLogged(result);
    }
  };

  return (
    <div className="overview-tab">
      {/* Top Section - Pet Display */}
      <div className="overview-header">
        <div className="pet-section">
          <Pet pet={pet} />
        </div>
      </div>

      {/* Bottom Section - Action Cards */}
      <div className="overview-content">
        {/* Quick Actions Card */}
        <div className="quick-actions-card">
          <h3 className="card-title">
            <span className="card-icon">⚡</span>
            Quick Actions
          </h3>
            <div className="action-content">
            <TimeLogger onActivityLogged={handleActivityLogged} />
          </div>
        </div>        {/* Today's Progress Card */}
        <div className="quick-stats-card">
          <h3 className="card-title">
            <span className="card-icon">📊</span>
            Today's Progress
          </h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-content">
                <div className="stat-value">
                  {isLoading ? '...' : todayStats.commits}
                </div>
                <div className="stat-label">Commits Today</div>
              </div>
              <div className="stat-icon">📝</div>
            </div>
            <div className="stat-item">
              <div className="stat-content">
                <div className="stat-value">
                  {isLoading ? '...' : formatCodingTime(todayStats.codingTime)}
                </div>
                <div className="stat-label">Coding Time</div>
              </div>
              <div className="stat-icon">⏱️</div>
            </div>            <div className="stat-item">
              <div className="stat-content">
                <div className="stat-value">
                  {isLoading ? '...' : (todayStats.totalXP || (pet?.experience || 0))}
                </div>
                <div className="stat-label">Total Experience</div>
              </div>
              <div className="stat-icon">⭐</div>
            </div>
          </div>
        </div>
          {/* GitHub Sync Card */}
        <div className="github-sync-card">
          <h3 className="card-title">
            <span className="card-icon">🔗</span>
            GitHub Sync
          </h3>
          <GitHubSync onSyncComplete={handleGitHubSyncComplete} />
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
