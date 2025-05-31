import React, { useState, useEffect } from 'react';
import { activityAPI } from '../services/api';
import './AchievementsTab.css';

const AchievementsTab = () => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalUnlocked: 0,
    totalAvailable: 0,
    recentlyUnlocked: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define achievement templates
  const achievementTemplates = [
    {
      id: 'first_commit',
      title: 'First Commit',
      description: 'Make your first Git commit',
      icon: '🌱',
      requirement: 1,
      type: 'commits',
      category: 'Getting Started'
    },
    {
      id: 'commit_streak_3',
      title: 'Consistent Coder',
      description: 'Commit code for 3 days in a row',
      icon: '🔥',
      requirement: 3,
      type: 'streak',
      category: 'Consistency'
    },
    {
      id: 'commit_streak_7',
      title: 'Week Warrior',
      description: 'Commit code for 7 days in a row',
      icon: '⚔️',
      requirement: 7,
      type: 'streak',
      category: 'Consistency'
    },
    {
      id: 'coding_time_1h',
      title: 'Hour Hero',
      description: 'Code for 1 hour in a single session',
      icon: '⏰',
      requirement: 60,
      type: 'session_time',
      category: 'Time Management'
    },
    {
      id: 'total_commits_10',
      title: 'Commit Champion',
      description: 'Make 10 total commits',
      icon: '📝',
      requirement: 10,
      type: 'total_commits',
      category: 'Productivity'
    },
    {
      id: 'total_commits_50',
      title: 'Git Master',
      description: 'Make 50 total commits',
      icon: '🎯',
      requirement: 50,
      type: 'total_commits',
      category: 'Productivity'
    },
    {
      id: 'xp_1000',
      title: 'XP Collector',
      description: 'Earn 1,000 total XP',
      icon: '⭐',
      requirement: 1000,
      type: 'total_xp',
      category: 'Experience'
    },
    {
      id: 'level_5',
      title: 'Level Up Champion',
      description: 'Reach Level 5',
      icon: '🚀',
      requirement: 5,
      type: 'level',
      category: 'Progression'
    }
  ];
  useEffect(() => {
    fetchAchievements();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const [todayStats, activities] = await Promise.all([
        activityAPI.getTodayStats(),
        activityAPI.getActivities()
      ]);

      // Calculate user progress for each achievement
      const userProgress = calculateUserProgress(todayStats, activities);
      
      // Determine which achievements are unlocked
      const unlockedAchievements = achievementTemplates.map(achievement => {
        const progress = userProgress[achievement.type] || 0;
        const isUnlocked = progress >= achievement.requirement;
        const progressPercentage = Math.min((progress / achievement.requirement) * 100, 100);

        return {
          ...achievement,
          isUnlocked,
          progress,
          progressPercentage,
          unlockedAt: isUnlocked ? new Date() : null // In a real app, store this in backend
        };
      });

      setAchievements(unlockedAchievements);
      
      const totalUnlocked = unlockedAchievements.filter(a => a.isUnlocked).length;
      const recentlyUnlocked = unlockedAchievements
        .filter(a => a.isUnlocked)
        .slice(-3); // Last 3 unlocked

      setStats({
        totalUnlocked,
        totalAvailable: achievementTemplates.length,
        recentlyUnlocked
      });

    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const calculateUserProgress = (todayStats, activities) => {
    const commitActivities = activities.filter(a => a.type === 'commit');
    const level = Math.floor(todayStats.totalXP / 100) + 1;

    return {
      commits: 1, // Placeholder - would calculate from actual data
      total_commits: commitActivities.length,
      streak: 3, // Placeholder - would calculate actual streak
      session_time: 45, // Placeholder - would calculate from time logs
      total_xp: todayStats.totalXP,
      level: level
    };
  };

  const groupedAchievements = achievementTemplates.reduce((groups, achievement) => {
    const category = achievement.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    
    const userAchievement = achievements.find(a => a.id === achievement.id);
    groups[category].push(userAchievement || achievement);
    
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="achievements-tab">
        <div className="loading">Loading achievements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="achievements-tab">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="achievements-tab">
      <div className="achievements-header">
        <h2>Achievements</h2>
        <p>Unlock rewards as you code and grow</p>
        
        <div className="achievements-overview">
          <div className="overview-stat">
            <span className="stat-number">{stats.totalUnlocked}</span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="overview-separator">/</div>
          <div className="overview-stat">
            <span className="stat-number">{stats.totalAvailable}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      <div className="achievements-content">
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category} className="achievement-category">
            <h3 className="category-title">{category}</h3>
            <div className="achievements-grid">
              {categoryAchievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">
                    {achievement.isUnlocked ? achievement.icon : '🔒'}
                  </div>
                  <div className="achievement-content">
                    <h4 className="achievement-title">{achievement.title}</h4>
                    <p className="achievement-description">{achievement.description}</p>
                    
                    {!achievement.isUnlocked && (
                      <div className="achievement-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${achievement.progressPercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {achievement.progress || 0} / {achievement.requirement}
                        </span>
                      </div>
                    )}
                    
                    {achievement.isUnlocked && (
                      <div className="achievement-unlocked">
                        <span className="unlocked-badge">Unlocked!</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsTab;