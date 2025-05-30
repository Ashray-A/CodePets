import React from "react";
import { useNotifications } from "../contexts/NotificationContext";
import AchievementToast from "./AchievementToast";
import EvolutionToast from "./EvolutionToast";
import "./NotificationContainer.css";

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  const renderNotification = (notification) => {
    switch (notification.type) {
      case "achievement":
        return (
          <AchievementToast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        );
      case "evolution":
        return (
          <EvolutionToast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        );
      case "success":
      case "error":
      case "info":
      default:
        return (
          <div
            key={notification.id}
            className={`notification-toast ${notification.type}`}
            onClick={() => removeNotification(notification.id)}
          >
            <div className="notification-content">
              <span className="notification-icon">{notification.icon}</span>
              <div className="notification-text">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">
                  {notification.message}
                </div>
              </div>
              <button
                className="notification-close"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="notification-container">
      {notifications.map(renderNotification)}
    </div>
  );
}

export default NotificationContainer;
