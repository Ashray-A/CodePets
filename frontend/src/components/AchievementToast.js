import React, { useEffect, useState } from "react";
import "./AchievementToast.css";

function AchievementToast({ notification, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const handleClick = () => {
    handleClose();
  };

  return (
    <div
      className={`achievement-toast ${isVisible ? "visible" : ""} ${
        isLeaving ? "leaving" : ""
      }`}
      onClick={handleClick}
    >
      <div className="achievement-toast-content">
        <div className="achievement-icon">
          <span className="achievement-emoji">{notification.icon}</span>
          <div className="achievement-glow"></div>
        </div>

        <div className="achievement-text">
          <div className="achievement-title">{notification.title}</div>
          <div className="achievement-message">{notification.message}</div>
          {notification.description && (
            <div className="achievement-description">
              {notification.description}
            </div>
          )}
        </div>

        <button
          className="achievement-close"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>

      <div className="achievement-shine"></div>
    </div>
  );
}

export default AchievementToast;
