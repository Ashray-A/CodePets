import React, { useState, useEffect } from "react";
import GitHubService from "../services/github";
import "./Achievements.css";

const Achievements = ({ refreshTrigger }) => {
  const [streakData, setStreakData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAchievements();
  }, [refreshTrigger]);

  const loadAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const streaksResponse = await GitHubService.getStreaks();
      setStreakData(streaksResponse);
    } catch (error) {
      console.error("Error loading achievements:", error);
      setError("Failed to load achievements");
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementProgress = () => {
    if (!streakData) return [];

    const progressAchievements = [
      {
        id: "first_commit",
        title: "First Steps",
        description: "Make your first commit",
        icon: "🌱",
        progress: streakData.weeklyStats.thisWeek.commits > 0 ? 100 : 0,
        threshold: 1,
        current: Math.min(streakData.weeklyStats.thisWeek.commits, 1),
      },
      {
        id: "streak_3",
        title: "Getting Started",
        description: "Code for 3 days in a row",
        icon: "🔥",
        progress: Math.min((streakData.currentStreak / 3) * 100, 100),
        threshold: 3,
        current: streakData.currentStreak,
      },
      {
        id: "streak_7",
        title: "Week Warrior",
        description: "Code for 7 days in a row",
        icon: "⚔️",
        progress: Math.min((streakData.currentStreak / 7) * 100, 100),
        threshold: 7,
        current: streakData.currentStreak,
      },
      {
        id: "streak_30",
        title: "Month Master",
        description: "Code for 30 days in a row",
        icon: "👑",
        progress: Math.min((streakData.currentStreak / 30) * 100, 100),
        threshold: 30,
        current: streakData.currentStreak,
      },
      {
        id: "commits_10",
        title: "Commit Crusher",
        description: "Make 10 commits this week",
        icon: "💪",
        progress: Math.min(
          (streakData.weeklyStats.thisWeek.commits / 10) * 100,
          100
        ),
        threshold: 10,
        current: streakData.weeklyStats.thisWeek.commits,
      },
      {
        id: "time_300",
        title: "Time Titan",
        description: "Code for 5 hours this week",
        icon: "⏰",
        progress: Math.min(
          (streakData.weeklyStats.thisWeek.codingTime / 300) * 100,
          100
        ),
        threshold: 300,
        current: streakData.weeklyStats.thisWeek.codingTime,
      },
    ];

    return progressAchievements;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  if (isLoading) {
    return (
      <div className="achievements-container">
        <h3 className="achievements-title">
          🏆 <span>Achievements</span>
        </h3>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading achievements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="achievements-container">
        <h3 className="achievements-title">
          🏆 <span>Achievements</span>
        </h3>
        <div className="error-state">
          <div className="error-message">⚠️ {error}</div>
          <button onClick={loadAchievements} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const progressAchievements = getAchievementProgress();
  const unlockedAchievements = progressAchievements.filter(
    (a) => a.progress >= 100
  );
  const inProgressAchievements = progressAchievements.filter(
    (a) => a.progress > 0 && a.progress < 100
  );
  const lockedAchievements = progressAchievements.filter(
    (a) => a.progress === 0
  );
  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h3 className="achievements-title">
          🏆 <span>Achievements</span>
        </h3>
        <div className="achievements-counter">
          {unlockedAchievements.length}/{progressAchievements.length}
        </div>
      </div>

      {streakData && (
        <div className="streak-overview">
          <div className="streak-stat">
            <div className="streak-icon">🔥</div>
            <div className="streak-value">{streakData.currentStreak}</div>
            <div className="streak-label">Current Streak</div>
          </div>
          <div className="streak-stat">
            <div className="streak-icon">📈</div>
            <div className="streak-value">{streakData.longestStreak}</div>
            <div className="streak-label">Best Streak</div>
          </div>
        </div>
      )}

      {unlockedAchievements.length > 0 && (
        <div className="achievement-section">
          <h4 className="section-title section-title--unlocked">
            ✅ <span>Unlocked</span>
          </h4>
          <div className="achievement-list">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="achievement-item achievement-item--unlocked"
              >
                <div className="achievement-content">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-details">
                    <div className="achievement-name">{achievement.title}</div>
                    <div className="achievement-description">
                      {achievement.description}
                    </div>{" "}
                    <div className="achievement-progress">
                      <div className="progress-bar progress-bar--unlocked">
                        <div
                          className="progress-fill progress-fill--unlocked"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text progress-text--unlocked">
                        Complete!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {inProgressAchievements.length > 0 && (
        <div className="achievement-section">
          <h4 className="section-title section-title--progress">
            🎯 <span>In Progress</span>
          </h4>
          <div className="achievement-list">
            {inProgressAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="achievement-item achievement-item--progress"
              >
                <div className="achievement-content">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-details">
                    <div className="achievement-name">{achievement.title}</div>
                    <div className="achievement-description">
                      {achievement.description}
                    </div>{" "}
                    <div className="achievement-progress">
                      <div className="progress-bar progress-bar--progress">
                        <div
                          className="progress-fill progress-fill--progress"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text progress-text--progress">
                        {achievement.id.includes("time")
                          ? `${formatTime(achievement.current)} / ${formatTime(
                              achievement.threshold
                            )}`
                          : `${achievement.current} / ${achievement.threshold}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lockedAchievements.length > 0 && (
        <div className="achievement-section">
          <h4 className="section-title section-title--locked">
            🔒 <span>Locked</span>
          </h4>
          <div className="achievement-list">
            {lockedAchievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className="achievement-item achievement-item--locked"
              >
                <div className="achievement-content">
                  <div className="achievement-icon achievement-icon--locked">
                    🔒
                  </div>
                  <div className="achievement-details">
                    <div className="achievement-name">{achievement.title}</div>
                    <div className="achievement-description">
                      {achievement.description}
                    </div>
                    <div className="achievement-progress">
                      <div className="progress-bar progress-bar--locked">
                        <div
                          className="progress-fill"
                          style={{ width: "0%" }}
                        ></div>
                      </div>{" "}
                      <span className="progress-text progress-text--locked">
                        {achievement.id.includes("time")
                          ? `0 / ${formatTime(achievement.threshold)}`
                          : `0 / ${achievement.threshold}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
