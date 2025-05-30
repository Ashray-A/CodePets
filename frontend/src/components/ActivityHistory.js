import React, { useState, useEffect, useCallback } from "react";
import { activityAPI } from "../services/api";
import "./ActivityHistory.css";

function ActivityHistory() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [activitiesResponse, statsResponse] = await Promise.all([
        activityAPI.getActivities({ limit: 10 }),
        activityAPI.getStats(selectedPeriod),
      ]);

      setActivities(activitiesResponse.data.activities);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Failed to fetch activity data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "commit":
        return "📝";
      case "coding_session":
        return "⏱️";
      case "manual_log":
        return "✏️";
      default:
        return "🔧";
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case "commit":
        return `Committed to ${activity.data.repository}: "${activity.data.message}"`;
      case "coding_session":
        return `Coded for ${activity.data.duration} minutes in ${
          activity.data.language
        }${activity.data.project ? ` on ${activity.data.project}` : ""}`;
      case "manual_log":
        return activity.data.description || "Manual coding session";
      default:
        return "Unknown activity";
    }
  };
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <span>Loading activity history...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="activity-history-container">
      <div className="activity-stats-card">
        <h3 className="activity-title">Your Progress</h3>
        <div className="period-buttons">
          <button
            className={`period-btn ${
              selectedPeriod === "week" ? "active" : "inactive"
            }`}
            onClick={() => setSelectedPeriod("week")}
          >
            This Week
          </button>
          <button
            className={`period-btn ${
              selectedPeriod === "month" ? "active" : "inactive"
            }`}
            onClick={() => setSelectedPeriod("month")}
          >
            This Month
          </button>
          <button
            className={`period-btn ${
              selectedPeriod === "year" ? "active" : "inactive"
            }`}
            onClick={() => setSelectedPeriod("year")}
          >
            This Year
          </button>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card commits">
              <div className="stat-number commits">{stats.commits}</div>
              <div className="stat-label commits">Commits</div>
            </div>
            <div className="stat-card time">
              <div className="stat-number time">
                {Math.floor(stats.totalCodingTime / 60)}h{" "}
                {stats.totalCodingTime % 60}m
              </div>
              <div className="stat-label time">Coding Time</div>
            </div>
            <div className="stat-card experience">
              <div className="stat-number experience">
                {stats.totalExperience}
              </div>
              <div className="stat-label experience">XP Gained</div>
            </div>
            <div className="stat-card sessions">
              <div className="stat-number sessions">{stats.codingSessions}</div>
              <div className="stat-label sessions">Sessions</div>
            </div>
          </div>
        )}

        {stats?.languageBreakdown &&
          Object.keys(stats.languageBreakdown).length > 0 && (
            <div className="languages-section">
              <h4 className="languages-title">Languages Used</h4>
              <div className="languages-list">
                {Object.entries(stats.languageBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([language, count]) => (
                    <div key={language} className="language-item">
                      <span className="language-name">{language}</span>
                      <span className="language-count">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>

      <div className="activity-recent-card">
        <h3 className="activity-title">Recent Activities</h3>
        {activities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <p className="empty-message">
              No activities yet. Start coding to see your progress!
            </p>
          </div>
        ) : (
          <div className="activities-list">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <div className="activity-description">
                    {getActivityDescription(activity)}
                  </div>
                  <div className="activity-meta">
                    <span className="activity-date">
                      {formatDate(activity.date)}
                    </span>
                    <span className="activity-xp">
                      +{activity.experience} XP
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityHistory;
