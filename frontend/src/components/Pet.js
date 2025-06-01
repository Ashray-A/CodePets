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
    const thresholds = pet.stageThresholds || {
      egg: 0,
      hatching: 50,
      baby: 150,
      juvenile: 350,
      teen: 650,
      young_adult: 1100,
      adult: 1800,
      elder: 2800,
      legendary: 4500,
    };

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
    const currentIndex = stages.indexOf(pet.stage);
    const nextStage = stages[currentIndex + 1];

    return nextStage ? thresholds[nextStage] : thresholds.legendary;
  };

  const getStageStatus = (stage) => {
    const thresholds = pet.stageThresholds || {
      egg: 0,
      hatching: 50,
      baby: 150,
      juvenile: 350,
      teen: 650,
      young_adult: 1100,
      adult: 1800,
      elder: 2800,
      legendary: 4500,
    };

    if (pet.experience >= thresholds[stage]) {
      return pet.stage === stage ? "current" : "completed";
    }    return "locked";
  };

  // Compact version for OverviewTab
  if (compact) {
    return (
      <div className="pet-container">
        <div className="pet-display">
          <span className="pet-emoji">{getPetEmoji(pet.stage)}</span>
          <h2 className="pet-name">{pet.name || "My Pet"}</h2>
          <p className="pet-stage">{pet.stage.replace("_", " ")} Stage</p>
        </div>
        <div className="experience-preview">
          <div className="exp-label">Experience Progress</div>
          <div className="exp-bar">
            <div
              className="exp-fill"
              style={{
                width: `${getProgressPercentage(
                  pet.experience,
                  getNextThreshold()
                )}%`,
              }}
            ></div>
          </div>
          <div className="exp-text">
            {pet.experience} / {getNextThreshold()} XP
          </div>
        </div>
      </div>
    );
  }

  // Full version for ProgressTab
  return (
    <div className="pet-container">
      <div className="pet-display">
        <span className="pet-emoji">{getPetEmoji(pet.stage)}</span>
        <h2 className="pet-name">{pet.name || "My Pet"}</h2>
        <p className="pet-stage">{pet.stage} Stage</p>
      </div>{" "}
      <div className="pet-stats">
        <div className="stat-card experience">
          <div className="stat-label">Experience</div>
          <div className="stat-value">
            {pet.experience} / {getNextThreshold()}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill experience"
              style={{
                width: `${getProgressPercentage(
                  pet.experience,
                  getNextThreshold()
                )}%`,
              }}
            ></div>
          </div>
        </div>
      </div>{" "}
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
