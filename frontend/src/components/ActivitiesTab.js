import React, { useState, useEffect } from 'react';
import { activityAPI } from '../services/api';
import './ActivitiesTab.css';

const ActivitiesTab = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    fetchActivities();
  }, []);
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getActivities();
      // Backend returns { activities: [...], pagination: {...} }
      setActivities(response.data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredActivities = () => {
    const now = new Date();
    let cutoffDate;

    switch (filter) {
      case 'today':
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return activities;
    }

    return activities.filter(activity => new Date(activity.date) >= cutoffDate);
  };
  const getActivityIcon = (type) => {
    switch (type) {
      case 'commit': return '📝';
      case 'coding_session': return '⏱️';
      case 'manual_log': return '⏱️';
      case 'achievement': return '🏆';
      case 'level_up': return '🎉';
      default: return '⚡';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'commit': return '#3b82f6';
      case 'coding_session': return '#10b981';
      case 'manual_log': return '#10b981';
      case 'achievement': return '#f59e0b';
      case 'level_up': return '#8b5cf6';
      default: return '#6b7280';
    }
  };
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'commit':
        return activity.data.message || 'Code commit';
      case 'coding_session':
        const duration = activity.data.duration || 0;
        const project = activity.data.project || 'Unknown project';
        return `Coded for ${duration} minutes on ${project}`;
      case 'manual_log':
        return activity.data.description || 'Manual coding session';
      default:
        return 'Activity';
    }
  };

  const getActivityDetails = (activity) => {
    switch (activity.type) {
      case 'commit':
        const repo = activity.data.repository || 'Unknown repo';
        const additions = activity.data.additions || 0;
        const deletions = activity.data.deletions || 0;
        return `${repo} • +${additions} -${deletions}`;
      case 'coding_session':
        const language = activity.data.language || 'Unknown';
        return `Language: ${language}`;
      default:
        return null;
    }
  };

  const filteredActivities = getFilteredActivities();

  if (loading) {
    return (
      <div className="activities-tab">
        <div className="loading">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activities-tab">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="activities-tab">
      <div className="activities-header">
        <h2>Activity Feed</h2>
        <p>Your coding journey timeline</p>
      </div>

      <div className="activities-filters">
        {['all', 'today', 'week', 'month'].map(filterOption => (
          <button
            key={filterOption}
            className={`filter-btn ${filter === filterOption ? 'active' : ''}`}
            onClick={() => setFilter(filterOption)}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      <div className="activities-list">
        {filteredActivities.length === 0 ? (
          <div className="no-activities">
            <span className="no-activities-icon">📭</span>
            <h3>No activities found</h3>
            <p>Start coding to see your activities here!</p>
          </div>
        ) : (          filteredActivities.map((activity, index) => (
            <div key={activity.id || activity._id || index} className="activity-item">
              <div className="activity-icon" style={{ backgroundColor: getActivityColor(activity.type) }}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <div className="activity-main">
                  <h4 className="activity-title">{getActivityDescription(activity)}</h4>
                  <span className="activity-time">{formatTimestamp(activity.date)}</span>
                </div>
                {getActivityDetails(activity) && (
                  <p className="activity-details">{getActivityDetails(activity)}</p>
                )}
                {activity.experience && (
                  <div className="activity-xp">
                    <span className="xp-badge">+{activity.experience} XP</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {filteredActivities.length > 0 && (
        <div className="activities-stats">
          <div className="stat-item">
            <span className="stat-value">{filteredActivities.length}</span>
            <span className="stat-label">Total Activities</span>
          </div>          <div className="stat-item">
            <span className="stat-value">
              {filteredActivities.reduce((total, activity) => total + (activity.experience || 0), 0)}
            </span>
            <span className="stat-label">XP Earned</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesTab;