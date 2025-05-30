import React, { useState, useEffect } from "react";
import { petAPI } from "../services/api";
import "./Leaderboard.css";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await petAPI.getLeaderboard();
      setLeaderboard(response.data || []);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setError("Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  const getStageEmoji = (stage) => {
    const stageEmojis = {
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
    return stageEmojis[stage] || "🥚";
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  if (isLoading) {
    return (
      <div className="leaderboard-container">
        <h3 className="leaderboard-title">
          🏆 <span>Leaderboard</span>
        </h3>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading rankings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <h3 className="leaderboard-title">
          🏆 <span>Leaderboard</span>
        </h3>
        <div className="error-state">
          <div className="error-message">⚠️ {error}</div>
          <button onClick={loadLeaderboard} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h3 className="leaderboard-title">
        🏆 <span>Leaderboard</span>
      </h3>

      <div className="leaderboard-list">
        {leaderboard.map((pet, index) => (
          <div
            key={pet._id || index}
            className={`leaderboard-item ${
              index < 3 ? "leaderboard-item--podium" : ""
            }`}
          >
            <div className="pet-rank">{getRankDisplay(index + 1)}</div>

            <div className="pet-info">
              <div className="pet-stage-emoji">{getStageEmoji(pet.stage)}</div>
              <div className="pet-details">
                <div className="pet-name">{pet.name}</div>
                <div className="pet-stage">{pet.stage}</div>
              </div>
            </div>

            <div className="pet-stats">
              <div className="stat-experience">{pet.experience} XP</div>
              <div className="stat-time">
                {Math.floor(pet.stats.totalCodingTime / 60)}h{" "}
                {pet.stats.totalCodingTime % 60}m
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <div className="empty-message">No pets on the leaderboard yet!</div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
