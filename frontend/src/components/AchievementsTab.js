import React from "react";
import Achievements from "./Achievements";
import "./AchievementsTab.css";

const AchievementsTab = () => {
  return (
    <div className="achievements-tab">
      <div className="achievements-content">
        <div className="achievements-card">
          <h3 className="card-title">
            <span className="card-icon">🏆</span>
            Your Achievements
          </h3>
          <Achievements />
        </div>
      </div>
    </div>
  );
};

export default AchievementsTab;
