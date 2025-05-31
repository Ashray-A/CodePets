import React from "react";
import Streaks from "./Streaks";
import "./ProgressTab.css";

const ProgressTab = ({ pet }) => {
  const getProgressPercentage = () => {
    if (!pet || !pet.stageThresholds) return 0;

    const currentStage = pet.stage;
    const stages = Object.keys(pet.stageThresholds);
    const currentIndex = stages.indexOf(currentStage);

    if (currentIndex === -1 || currentIndex === stages.length - 1) return 100;

    const currentThreshold = pet.stageThresholds[currentStage];
    const nextThreshold = pet.stageThresholds[stages[currentIndex + 1]];
    const progress = pet.experience - currentThreshold;
    const required = nextThreshold - currentThreshold;

    return Math.min(100, (progress / required) * 100);
  };

  const getNextStage = () => {
    if (!pet || !pet.stageThresholds) return null;

    const stages = Object.keys(pet.stageThresholds);
    const currentIndex = stages.indexOf(pet.stage);

    if (currentIndex === -1 || currentIndex === stages.length - 1) return null;

    return stages[currentIndex + 1];
  };

  const getXPToNext = () => {
    if (!pet || !pet.stageThresholds) return 0;

    const stages = Object.keys(pet.stageThresholds);
    const currentIndex = stages.indexOf(pet.stage);

    if (currentIndex === -1 || currentIndex === stages.length - 1) return 0;

    const nextThreshold = pet.stageThresholds[stages[currentIndex + 1]];
    return Math.max(0, nextThreshold - pet.experience);
  };

  const formatStageName = (stage) => {
    return (
      stage
        ?.split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") || ""
    );
  };

  return (
    <div className="progress-tab">
      <div className="progress-content">
        {/* Pet Evolution Progress */}
        <div className="evolution-progress-card">
          <h3 className="card-title">
            <span className="card-icon">🌱</span>
            Evolution Progress
          </h3>
          <div className="evolution-info">
            <div className="current-stage">
              <span className="stage-label">Current Stage:</span>
              <span className="stage-name">{formatStageName(pet?.stage)}</span>
            </div>

            {getNextStage() && (
              <>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>

                <div className="next-stage-info">
                  <span className="next-stage-label">Next Stage:</span>
                  <span className="next-stage-name">
                    {formatStageName(getNextStage())}
                  </span>
                  <span className="xp-needed">{getXPToNext()} XP needed</span>
                </div>
              </>
            )}

            {!getNextStage() && (
              <div className="max-level">
                <span className="max-level-text">
                  🏆 Maximum Evolution Reached!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Experience Stats */}
        <div className="experience-stats-card">
          <h3 className="card-title">
            <span className="card-icon">⭐</span>
            Experience Stats
          </h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{pet?.experience || 0}</div>
              <div className="stat-label">Total XP</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{pet?.happiness || 0}</div>
              <div className="stat-label">Happiness</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{pet?.health || 0}</div>
              <div className="stat-label">Health</div>
            </div>
          </div>
        </div>

        {/* Streaks Component */}
        <div className="streaks-card">
          <h3 className="card-title">
            <span className="card-icon">🔥</span>
            Coding Streaks
          </h3>
          <Streaks />
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;
