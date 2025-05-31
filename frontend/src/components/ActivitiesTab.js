import React from "react";
import ActivityFeed from "./ActivityFeed";
import "./ActivitiesTab.css";

const ActivitiesTab = ({ activityRefreshTrigger }) => {
  return (
    <div className="activities-tab">
      <div className="activities-content">
        <div className="activities-card">
          <h3 className="card-title">
            <span className="card-icon">📝</span>
            Recent Activities
          </h3>
          <ActivityFeed key={activityRefreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default ActivitiesTab;
