import React, { useEffect, useState } from "react";
import "./EvolutionToast.css";

function EvolutionToast({ notification, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showNewStage, setShowNewStage] = useState(false);

  const getPetEmoji = (stage) => {
    const emojis = {
      egg: "🥚",
      baby: "🐣",
      teen: "🐤",
      junior: "🐦",
      adult: "🦅",
      senior: "🦉",
      veteran: "🦚",
      master: "🐉",
      legendary: "👑",
    };
    return emojis[stage] || "🥚";
  };

  useEffect(() => {
    // Trigger entrance animation
    const timer1 = setTimeout(() => setIsVisible(true), 50);

    // Show evolution animation after entrance
    const timer2 = setTimeout(() => setShowNewStage(true), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
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
      className={`evolution-toast ${isVisible ? "visible" : ""} ${
        isLeaving ? "leaving" : ""
      }`}
      onClick={handleClick}
    >
      <div className="evolution-toast-content">
        <div className="evolution-animation">
          <div
            className={`pet-stage old-stage ${showNewStage ? "fade-out" : ""}`}
          >
            <span className="pet-emoji">
              {getPetEmoji(notification.oldStage)}
            </span>
          </div>

          <div className="evolution-sparkles">
            <span className="sparkle sparkle-1">✨</span>
            <span className="sparkle sparkle-2">⭐</span>
            <span className="sparkle sparkle-3">💫</span>
            <span className="sparkle sparkle-4">✨</span>
          </div>

          <div
            className={`pet-stage new-stage ${showNewStage ? "fade-in" : ""}`}
          >
            <span className="pet-emoji">
              {getPetEmoji(notification.newStage)}
            </span>
          </div>
        </div>

        <div className="evolution-text">
          <div className="evolution-title">{notification.title}</div>
          <div className="evolution-message">{notification.message}</div>
          {notification.description && (
            <div className="evolution-description">
              {notification.description}
            </div>
          )}
          <div className="evolution-stages">
            <span className="stage-name">{notification.oldStage}</span>
            <span className="evolution-arrow">→</span>
            <span className="stage-name new">{notification.newStage}</span>
          </div>
        </div>

        <button
          className="evolution-close"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>

      <div className="evolution-background-sparkles">
        {[...Array(12)].map((_, i) => (
          <span key={i} className={`bg-sparkle bg-sparkle-${i + 1}`}>
            ✨
          </span>
        ))}
      </div>
    </div>
  );
}

export default EvolutionToast;
