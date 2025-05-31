import React, { useState, useEffect } from 'react';
import { activityAPI } from '../services/api';
import './ProgressTab.css';

const ProgressTab = () => {
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    xpToNextLevel: 100,
    weeklyGoal: 1000,
    weeklyProgress: 0,
    streaks: {
      current: 0,
      longest: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const [todayStats, activities] = await Promise.all([
        activityAPI.getTodayStats(),
        activityAPI.getActivities()
      ]);

      // Calculate level and XP
      const level = Math.floor(todayStats.totalXP / 100) + 1;
      const xpToNextLevel = 100 - (todayStats.totalXP % 100);

      // Calculate weekly progress (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyXP = activities
        .filter(activity => new Date(activity.timestamp) >= oneWeekAgo)
        .reduce((total, activity) => total + (activity.xp || 0), 0);

      setStats({
        totalXP: todayStats.totalXP,
        level,
        xpToNextLevel,
        weeklyGoal: 1000,
        weeklyProgress: weeklyXP,
        streaks: {
          current: 5, // TODO: Calculate from actual data
          longest: 12 // TODO: Calculate from actual data
        }
      });
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
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

  const weeklyProgressPercentage = Math.min((stats.weeklyProgress / stats.weeklyGoal) * 100, 100);
  const levelProgressPercentage = ((100 - stats.xpToNextLevel) / 100) * 100;

  return (
    <div className="progress-tab">
      <div className="progress-header">
        <h2>Your Progress</h2>
        <p>Track your coding journey and achievements</p>
      </div>

      <div className="progress-grid">
        {/* Level Progress */}
        <div className="progress-card level-card">
          <div className="card-header">
            <h3>Level Progress</h3>
            <span className="level-badge">Level {stats.level}</span>
          </div>
          <div className="level-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${levelProgressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {100 - stats.xpToNextLevel} / 100 XP
            </div>
          </div>
          <p className="progress-subtitle">
            {stats.xpToNextLevel} XP to Level {stats.level + 1}
          </p>
        </div>

        {/* Total XP */}
        <div className="progress-card xp-card">
          <div className="card-header">
            <h3>Total Experience</h3>
            <span className="xp-icon">⭐</span>
          </div>
          <div className="xp-amount">{stats.totalXP.toLocaleString()}</div>
          <p className="progress-subtitle">XP Earned</p>
        </div>

        {/* Weekly Goal */}
        <div className="progress-card weekly-card">
          <div className="card-header">
            <h3>Weekly Goal</h3>
            <span className="goal-icon">🎯</span>
          </div>
          <div className="weekly-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill weekly" 
                style={{ width: `${weeklyProgressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {stats.weeklyProgress} / {stats.weeklyGoal} XP
            </div>
          </div>
          <p className="progress-subtitle">
            {Math.round(weeklyProgressPercentage)}% Complete
          </p>
        </div>

        {/* Streaks */}
        <div className="progress-card streaks-card">
          <div className="card-header">
            <h3>Coding Streaks</h3>
            <span className="streak-icon">🔥</span>
          </div>
          <div className="streaks-content">
            <div className="streak-item">
              <span className="streak-value">{stats.streaks.current}</span>
              <span className="streak-label">Current Streak</span>
            </div>
            <div className="streak-divider"></div>
            <div className="streak-item">
              <span className="streak-value">{stats.streaks.longest}</span>
              <span className="streak-label">Longest Streak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;