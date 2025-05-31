import React from "react";
import "./Navigation.css";

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "progress", label: "Progress", icon: "📈" },
    { id: "activities", label: "Activities", icon: "⚡" },
    { id: "achievements", label: "Achievements", icon: "🏆" },
  ];

  return (
    <nav className="navigation">
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
