import React, { useState, useEffect } from 'react';
import Pet from './Pet';
import TimeLogger from './TimeLogger';
import GitHubSync from './GitHubSync';
import ActivityFeed from './ActivityFeed';
import Streaks from './Streaks';
import Achievements from './Achievements';
import { petAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

  // Fetch pet data on component mount
  useEffect(() => {
    fetchPetData();
  }, []);
  
  const fetchPetData = async () => {
    try {
      setLoading(true);
      const response = await petAPI.getPet();
      setPet(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch pet data:', err);
      setError('Failed to load pet data');
      // Create default pet data for demo when backend is not available
      setPet({
        name: 'My Pet',
        stage: 'egg',
        experience: 0,
        happiness: 50,
        health: 100,
        nextThreshold: 100,
        stageThresholds: {
          egg: 0,
          baby: 100,
          teen: 500,
          adult: 1500,
          master: 3000
        }
      });
    } finally {
      setLoading(false);
    }
  };
  const handleActivityLogged = async (activityData) => {
    // Refresh pet data when new activity is logged
    await fetchPetData();
    // Trigger activity feed refresh
    setActivityRefreshTrigger(prev => prev + 1);
  };
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Loading your pet...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <div className="error-card">
            <div className="error-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="error-message">{error}</p>
            <button onClick={fetchPetData} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <div className="dashboard-grid">
          
          {/* Left Column - Pet and Actions */}
          <div className="dashboard-left">
              {/* Pet Display */}
            <div className="pet-section">
              <Pet pet={pet} />
            </div>
            
            {/* Actions Grid */}
            <div className="actions-grid">
              
              {/* Time Logger */}
              <div className="action-card">
                <div className="action-header">
                  <div className="action-icon time-tracker">
                    ⏱️
                  </div>
                  <h3 className="action-title">Coding Time Tracker</h3>
                </div>
                <TimeLogger onActivityLogged={handleActivityLogged} />
              </div>
              
            </div>
            
            {/* GitHub Sync - Full Width */}
            <div className="github-sync-section">
              <GitHubSync onSyncComplete={handleActivityLogged} />
            </div>
            
          </div>
          
          {/* Right Sidebar */}
          <div className="dashboard-right">
            <Streaks refreshTrigger={activityRefreshTrigger} />
            <Achievements refreshTrigger={activityRefreshTrigger} />
            <ActivityFeed refreshTrigger={activityRefreshTrigger} />
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default Dashboard;