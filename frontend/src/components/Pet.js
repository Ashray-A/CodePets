import React from "react";
import "./Pet.css";

function Pet({ pet, compact = false }) {
  if (!pet) {
    return (
      <div className="pet-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading pet data...</p>
        </div>
      </div>
    );
  }

  // Define thresholds consistently
  const STAGE_THRESHOLDS = {
    egg: 0,
    hatching: 200,
    baby: 600,
    juvenile: 1500,
    teen: 3000,
    young_adult: 5500,
    adult: 9000,
    elder: 15000,
    legendary: 25000,
  };

  // Calculate correct stage based on experience
  const calculateCorrectStage = (experience) => {
    if (experience >= STAGE_THRESHOLDS.legendary) return "legendary";
    if (experience >= STAGE_THRESHOLDS.elder) return "elder";
    if (experience >= STAGE_THRESHOLDS.adult) return "adult";
    if (experience >= STAGE_THRESHOLDS.young_adult) return "young_adult";
    if (experience >= STAGE_THRESHOLDS.teen) return "teen";
    if (experience >= STAGE_THRESHOLDS.juvenile) return "juvenile";
    if (experience >= STAGE_THRESHOLDS.baby) return "baby";
    if (experience >= STAGE_THRESHOLDS.hatching) return "hatching";
    return "egg";
  };

  // Use calculated stage instead of backend stage (which might be outdated)
  const currentStage = calculateCorrectStage(pet.experience);

  const getPetEmoji = (stage) => {
    const emojis = {
      egg: "🥚",
      hatching: "🐣",
      baby: "🐤",
      juvenile: "🐥",
      teen: "🦆",
      young_adult: "🦢",
      adult: "🦅",
      elder: "🦉",
      legendary: "🐲",
    };
    return emojis[stage] || "🥚";
  };

  const getProgressPercentage = (current, max) => {
    return Math.min((current / max) * 100, 100);
  };

  const getNextThreshold = () => {
    const stages = [
      "egg",
      "hatching",
      "baby",
      "juvenile",
      "teen",
      "young_adult",
      "adult",
      "elder",
      "legendary",
    ];
    const currentIndex = stages.indexOf(currentStage);
    const nextStage = stages[currentIndex + 1];

    return nextStage ? STAGE_THRESHOLDS[nextStage] : STAGE_THRESHOLDS.legendary;
  };

  const getStageStatus = (stage) => {
    if (pet.experience >= STAGE_THRESHOLDS[stage]) {
      return currentStage === stage ? "current" : "completed";
    }
    return "locked";
  }; // Full version for OverviewTab and ProgressTab
  return (
    <div className="pet-container">
      <div className="pet-display">
        <span className="pet-emoji">{getPetEmoji(currentStage)}</span>
        <h2 className="pet-name">{pet.name || "My Pet"}</h2>
        <p className="pet-stage">{currentStage.replace("_", " ")} Stage</p>
        <div className="pet-xp-display">
          <div className="xp-info">
            {pet.experience} / {getNextThreshold()} XP
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${getProgressPercentage(
                  pet.experience,
                  getNextThreshold()
                )}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="pet-stats">
        <div className="stat-card">
          <div className="stat-label">Experience</div>
          <div className="stat-value">
            {pet.experience} / {getNextThreshold()}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${getProgressPercentage(
                  pet.experience,
                  getNextThreshold()
                )}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="growth-stages">
        <h3 className="growth-title">Growth Stages</h3>
        <div className="stages-container">
          {[
            "egg",
            "hatching",
            "baby",
            "juvenile",
            "teen",
            "young_adult",
            "adult",
            "elder",
            "legendary",
          ].map((stage, index, array) => (
            <React.Fragment key={stage}>
              <div className={`stage-item ${getStageStatus(stage)}`}>
                <span className="stage-emoji">{getPetEmoji(stage)}</span>
                <span className="stage-name">{stage.replace("_", " ")}</span>
              </div>
              {index < array.length - 1 && (
                <span className="stage-arrow">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pet;
