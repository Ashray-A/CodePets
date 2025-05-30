import React, { useState, useEffect } from "react";
import api from "../services/api";
import "./Streaks.css";

const Streaks = ({ refreshTrigger }) => {
  const [streaks, setStreaks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStreaks();
  }, [refreshTrigger]);

  const loadStreaks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get("/activities/streaks");
      setStreaks(response.data);
    } catch (error) {
      console.error("Error loading streaks:", error);
      setError("Failed to load streaks data");
    } finally {
      setIsLoading(false);
    }
  };

  const getStreakMessage = (streak) => {
    if (streak === 0) return "Start your coding journey! 🚀";
    if (streak === 1) return "Great start! Keep it up! 💪";
    if (streak < 7) return "Building momentum! 🔥";
    if (streak < 30) return "You're on fire! 🔥🔥";
    return "Legendary coder! 👑";
  };
  const getStreakColor = (streak) => {
    if (streak === 0) return "streak-number--inactive";
    if (streak < 7) return "streak-number--building";
    if (streak < 30) return "streak-number--hot";
    return "streak-number--legendary";
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  if (isLoading) {
    return (
      <div className="streaks-container">
        <h3 className="streaks-title">
          🔥 <span>Coding Streaks</span>
        </h3>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading streaks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="streaks-container">
        <h3 className="streaks-title">
          🔥 <span>Coding Streaks</span>
        </h3>
        <div className="error-state">
          <div className="error-message">⚠️ {error}</div>
          <button onClick={loadStreaks} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="streaks-container">
      <h3 className="streaks-title">
        🔥 <span>Coding Streaks</span>
      </h3>

      <div className="streaks-content">
        <div className="current-streak-card">
          <div className="streak-display">
            <div
              className={`streak-number ${getStreakColor(
                streaks.currentStreak
              )}`}
            >
              {streaks.currentStreak}
            </div>
            <div className="streak-label">Day Streak</div>
            <div className="streak-message">
              {getStreakMessage(streaks.currentStreak)}
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div className="longest-streak-badge">
              <span className="longest-streak-label">Longest:</span>
              <span className="longest-streak-value">
                {streaks.longestStreak}
              </span>
              <span className="longest-streak-unit">days</span>
            </div>
          </div>
        </div>

        <div className="weekly-progress-card">
          <h4 className="weekly-title">
            📊 <span>Weekly Progress</span>
          </h4>
          <div className="weekly-stats-grid">
            <div className="weekly-stat-item">
              <div className="weekly-stat-label">This Week</div>
              <div className="weekly-stat-content">
                <div className="weekly-commits">
                  {streaks.weeklyStats.thisWeek.commits} commits
                </div>
                <div className="weekly-time">
                  {formatTime(streaks.weeklyStats.thisWeek.codingTime)}
                </div>
              </div>
            </div>
            <div className="weekly-stat-item">
              <div className="weekly-stat-label">Last Week</div>
              <div className="weekly-stat-content">
                <div className="weekly-commits weekly-commits--last">
                  {streaks.weeklyStats.lastWeek.commits} commits
                </div>
                <div className="weekly-time">
                  {formatTime(streaks.weeklyStats.lastWeek.codingTime)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {streaks.achievements && streaks.achievements.length > 0 && (
        <div className="achievements-card">
          <h4 className="achievements-title">
            🏆 <span>Recent Achievements</span>
          </h4>
          <div className="achievements-list">
            {streaks.achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-item">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <div className="achievement-title">{achievement.title}</div>
                  <div className="achievement-description">
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="daily-activity-card">
        <h4 className="daily-activity-title">
          📅 <span>Last 7 Days</span>
        </h4>
        <div className="daily-activity-grid">
          {Object.keys(streaks.dailyActivity || {}).map((day) => {
            const activity = streaks.dailyActivity[day];
            const hasActivity = activity.totalActivity > 0;
            const date = new Date(day);
            const dayName = date.toLocaleDateString("en-US", {
              weekday: "short",
            });

            return (
              <div key={day} className="daily-activity-item">
                <div className="day-label">{dayName}</div>
                <div
                  className={`day-indicator ${
                    hasActivity
                      ? "day-indicator--active"
                      : "day-indicator--inactive"
                  }`}
                >
                  {hasActivity ? "✓" : "○"}
                </div>
                <div className="day-stats">
                  {activity.commits > 0 && (
                    <div className="day-commits">{activity.commits}c</div>
                  )}
                  {activity.codingTime > 0 && (
                    <div className="day-time">
                      {Math.round(activity.codingTime / 60)}h
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Streaks;
