import React, { useState, useEffect } from "react";
import Pet from "./Pet";
import TimeLogger from "./TimeLogger";
import GitHubSync from "./GitHubSync";
import ActivityFeed from "./ActivityFeed";
import Streaks from "./Streaks";
import Achievements from "./Achievements";
import Leaderboard from "./Leaderboard";
import { petAPI } from "../services/api";
import "./Dashboard.css";

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
      console.error("Failed to fetch pet data:", err);
      setError("Failed to load pet data");
      // Create default pet data for demo when backend is not available
      setPet({
        name: "My Pet",
        stage: "egg",
        experience: 0,
        happiness: 50,
        health: 100,
        nextThreshold: 100,
        stageThresholds: {
          egg: 0,
          baby: 100,
          teen: 500,
          junior: 1000,
          adult: 2000,
          senior: 3500,
          veteran: 5500,
          master: 8000,
          legendary: 12000,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivityLogged = async (activityData) => {
    // Refresh pet data when new activity is logged
    await fetchPetData();
    // Trigger activity feed refresh
    setActivityRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loading-animation">
            <div className="loading-pet">🥚</div>
            <div className="loading-sparkles">
              <span>✨</span>
              <span>🌟</span>
              <span>✨</span>
            </div>
          </div>
          <h3 className="loading-title">Hatching your companion...</h3>
          <p className="loading-subtitle">
            Please wait while we prepare your coding adventure
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <div className="error-animation">
            <div className="error-icon">⚠️</div>
            <div className="error-particles">
              <span>💔</span>
              <span>😢</span>
              <span>💔</span>
            </div>
          </div>
          <h3 className="error-title">Oops! Something went wrong</h3>
          <p className="error-message">{error}</p>
          <button onClick={fetchPetData} className="retry-button">
            <span className="retry-icon">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">🌟</span>
            CodePets Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Watch your coding companion grow with every line of code!
          </p>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="dashboard-main">
        <div className="dashboard-layout">
          {/* Left Column - Primary Content */}
          <div className="dashboard-primary">
            {/* Pet Display - Featured Section */}
            <section className="pet-section">
              <Pet pet={pet} />
            </section>

            {/* Quick Actions */}
            <section className="actions-section">
              <h2 className="section-title">
                <span className="section-icon">⚡</span>
                Quick Actions
              </h2>
              <div className="actions-grid">
                <div className="action-card">
                  <TimeLogger onActivityLogged={handleActivityLogged} />
                </div>
                <div className="action-card">
                  <GitHubSync onSyncComplete={handleActivityLogged} />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Stats & Progress */}
          <div className="dashboard-sidebar">
            {/* Progress Tracking */}
            <section className="progress-section">
              <h2 className="section-title">
                <span className="section-icon">📊</span>
                Progress
              </h2>
              <div className="progress-cards">
                <Streaks refreshTrigger={activityRefreshTrigger} />
                <Achievements refreshTrigger={activityRefreshTrigger} />
              </div>
            </section>

            {/* Community */}
            <section className="community-section">
              <h2 className="section-title">
                <span className="section-icon">🏆</span>
                Community
              </h2>
              <Leaderboard />
            </section>

            {/* Activity Feed */}
            <section className="activity-section">
              <h2 className="section-title">
                <span className="section-icon">📝</span>
                Recent Activity
              </h2>
              <ActivityFeed refreshTrigger={activityRefreshTrigger} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
