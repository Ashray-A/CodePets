import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import OverviewTab from "./OverviewTab";
import ProgressTab from "./ProgressTab";
import ActivitiesTab from "./ActivitiesTab";
import AchievementsTab from "./AchievementsTab";
import { petAPI } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
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
      setError("Failed to load pet data"); // Create default pet data for demo when backend is not available
      setPet({
        name: "My Pet",
        stage: "egg",
        experience: 0,
        happiness: 50,
        health: 100,
        nextThreshold: 50,
        stageThresholds: {
          egg: 0,
          hatching: 50,
          baby: 150,
          juvenile: 350,
          teen: 650,
          young_adult: 1100,
          adult: 1800,
          elder: 2800,
          legendary: 4500,
        },
      });
    } finally {
      setLoading(false);
    }
  };  const handleActivityLogged = async (activityData) => {
    // Refresh pet data when new activity is logged
    await fetchPetData();
    // Trigger activity feed refresh
    setActivityRefreshTrigger((prev) => prev + 1);
  };

  const handleSyncComplete = async () => {
    // Refresh pet data when GitHub sync is complete
    await fetchPetData();
    setActivityRefreshTrigger((prev) => prev + 1);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            pet={pet} 
            onActivityLogged={handleActivityLogged}
            onSyncComplete={handleSyncComplete}
            refreshTrigger={activityRefreshTrigger}
          />
        );
      case 'progress':
        return <ProgressTab />;
      case 'activities':
        return <ActivitiesTab />;
      case 'achievements':
        return <AchievementsTab />;
      default:
        return (
          <OverviewTab 
            pet={pet} 
            onActivityLogged={handleActivityLogged}
            onSyncComplete={handleSyncComplete}
            refreshTrigger={activityRefreshTrigger}
          />
        );
    }
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
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
      <div className="dashboard-container">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="dashboard-content">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
