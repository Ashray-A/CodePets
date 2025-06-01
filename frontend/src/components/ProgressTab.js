import React, { useState, useEffect } from 'react';
import { activityAPI } from '../services/api';
import './ProgressTab.css';

const ProgressTab = () => {
  const [stats, setStats] = useState({
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    weeklyGoal: 500,
    weeklyProgress: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);      const [todayStats] = await Promise.all([
        activityAPI.getTodayStats()
      ]);

      // Calculate level and XP progression
      const totalXP = todayStats.totalXP || 0;
      const level = Math.floor(totalXP / 100) + 1;
      const currentXP = totalXP % 100;
      const xpToNextLevel = 100 - currentXP;

      // Calculate weekly progress (mock data for now)
      const weeklyGoal = 500;
      const weeklyProgress = Math.min(totalXP * 0.7, weeklyGoal); // Mock calculation

      // Get streak data (mock for now)
      const currentStreak = 3; // Would calculate from actual activity data
      const longestStreak = 7; // Would calculate from actual activity data

      setStats({
        level,
        currentXP,
        xpToNextLevel,
        totalXP,
        weeklyGoal,
        weeklyProgress,
        currentStreak,
        longestStreak
      });

    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgressPercentage = () => {
    return (stats.currentXP / 100) * 100;
  };

  const getWeeklyProgressPercentage = () => {
    return (stats.weeklyProgress / stats.weeklyGoal) * 100;
  };

  if (loading) {
    return (
      <div className="progress-tab">
        <div className="loading">Loading progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-tab">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="progress-tab">
      <div className="progress-header">
        <h2>Your Progress</h2>
        <p>Track your coding journey and achievements</p>
      </div>

      <div className="progress-grid">
        {/* Level Progress Card */}
        <div className="progress-card">
          <div className="card-header">
            <h3>Level Progress</h3>
            <div className="level-badge">Level {stats.level}</div>
          </div>
          <div className="level-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${getLevelProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {stats.currentXP} / 100 XP to next level
            </div>
          </div>
          <p className="progress-subtitle">
            {stats.xpToNextLevel} XP needed for Level {stats.level + 1}
          </p>
        </div>

        {/* Total XP Card */}
        <div className="progress-card">
          <div className="card-header">
            <h3>Experience Points</h3>
            <span className="xp-icon">⭐</span>
          </div>
          <div className="xp-amount">{stats.totalXP.toLocaleString()}</div>
          <p className="progress-subtitle">Total XP earned</p>
        </div>

        {/* Weekly Goal Card */}
        <div className="progress-card">
          <div className="card-header">
            <h3>Weekly Goal</h3>
            <span className="goal-icon">🎯</span>
          </div>
          <div className="weekly-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill weekly"
                style={{ width: `${getWeeklyProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(stats.weeklyProgress)} / {stats.weeklyGoal} XP this week
            </div>
          </div>
          <p className="progress-subtitle">
            {Math.round(getWeeklyProgressPercentage())}% of weekly goal completed
          </p>
        </div>

        {/* Streaks Card */}
        <div className="progress-card">
          <div className="card-header">
            <h3>Coding Streaks</h3>
            <span className="streak-icon">🔥</span>
          </div>
          <div className="streaks-content">
            <div className="streak-item">
              <span className="streak-value">{stats.currentStreak}</span>
              <span className="streak-label">Current</span>
            </div>
            <div className="streak-divider"></div>
            <div className="streak-item">
              <span className="streak-value">{stats.longestStreak}</span>
              <span className="streak-label">Best</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;