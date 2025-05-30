import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./ActivityFeed.css";

const ActivityFeed = ({ refreshTrigger }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActivities();
  }, [refreshTrigger]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get("/activities", {
        params: {
          limit: 20,
          page: 1,
        },
      });

      setActivities(response.data.activities || []);
    } catch (error) {
      console.error("Error loading activities:", error);
      setError("Failed to load activity feed");
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "commit":
        return "📝";
      case "coding_session":
        return "💻";
      case "manual_log":
        return "✍️";
      default:
        return "🎯";
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case "commit":
        return (
          <div className="activity-description">
            <div className="activity-main-text">
              {activity.data.message || "No message"}
            </div>
            <div className="activity-meta">
              <span className="activity-repo">{activity.data.repository}</span>
              {activity.data.additions > 0 && (
                <span className="activity-tag activity-tag--success">
                  +{activity.data.additions}
                </span>
              )}
              {activity.data.deletions > 0 && (
                <span className="activity-tag activity-tag--danger">
                  -{activity.data.deletions}
                </span>
              )}
            </div>
          </div>
        );
      case "coding_session":
        return (
          <div className="activity-description">
            <div className="activity-main-text">
              Coded for {activity.data.duration} minutes
            </div>
            <div className="activity-meta">
              <span className="activity-tag activity-tag--primary">
                {activity.data.language}
              </span>
              <span className="activity-repo">{activity.data.project}</span>
            </div>
          </div>
        );
      case "manual_log":
        return (
          <div className="activity-description">
            <div className="activity-main-text">
              {activity.data.description || "Manual activity log"}
            </div>
          </div>
        );
      default:
        return <div className="activity-description">Unknown activity</div>;
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return activityDate.toLocaleDateString();
  };
  if (isLoading) {
    return (
      <div className="activity-feed">
        <h3 className="activity-title">
          📊 <span>Recent Activity</span>
        </h3>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading activities...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-feed">
        <h3 className="activity-title">
          📊 <span>Recent Activity</span>
        </h3>
        <div className="error-state">
          <div className="error-message">⚠️ {error}</div>
          <button onClick={loadActivities} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="activity-feed">
      <div className="activity-header">
        <h3 className="activity-title">
          📊 <span>Recent Activity</span>
        </h3>
        <button
          onClick={loadActivities}
          className="refresh-btn"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p className="empty-message">
            No activities yet. Start coding or sync your GitHub to see
            activities here!
          </p>
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                {getActivityDescription(activity)}
                <div className="activity-footer">
                  <span className="activity-xp">+{activity.experience} XP</span>
                  <span className="activity-time">
                    {formatRelativeTime(activity.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
