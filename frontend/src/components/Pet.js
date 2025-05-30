import React from "react";
import "./Pet.css";

function Pet({ pet }) {
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

  const getProgressPercentage = (current, max) => {
    return Math.min((current / max) * 100, 100);
  };
  const getNextThreshold = () => {
    const thresholds = pet.stageThresholds || {
      egg: 0,
      baby: 100,
      teen: 500,
      junior: 1000,
      adult: 2000,
      senior: 3500,
      veteran: 5500,
      master: 8000,
      legendary: 12000,
    };

    const stages = [
      "egg",
      "baby",
      "teen",
      "junior",
      "adult",
      "senior",
      "veteran",
      "master",
      "legendary",
    ];
    const currentIndex = stages.indexOf(pet.stage);
    const nextStage = stages[currentIndex + 1];

    return nextStage ? thresholds[nextStage] : thresholds.legendary;
  };
  const getStageStatus = (stage) => {
    const thresholds = pet.stageThresholds || {
      egg: 0,
      baby: 100,
      teen: 500,
      junior: 1000,
      adult: 2000,
      senior: 3500,
      veteran: 5500,
      master: 8000,
      legendary: 12000,
    };

    if (pet.experience >= thresholds[stage]) {
      return pet.stage === stage ? "current" : "completed";
    }
    return "locked";
  };

  return (
    <div className="pet-container">
      {" "}
      <div className="pet-display">
        <span className="pet-emoji">{getPetEmoji(pet.stage)}</span>
        <h2 className="pet-name">{pet.name || "My Pet"}</h2>
        <p className="pet-info">{pet.stage} Stage</p>
      </div>{" "}
      <div className="pet-stats">
        <div className="stat-row">
          <span className="stat-label">📊 Experience</span>
          <span className="stat-value">
            {pet.experience} / {getNextThreshold()}
          </span>
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
      <div className="growth-stages">
        <h3 className="growth-title">Growth Stages</h3>{" "}
        <div className="stages-container">
          {[
            "egg",
            "baby",
            "teen",
            "junior",
            "adult",
            "senior",
            "veteran",
            "master",
            "legendary",
          ].map((stage, index, array) => (
            <React.Fragment key={stage}>
              <div className={`stage-item ${getStageStatus(stage)}`}>
                <span className="stage-emoji">{getPetEmoji(stage)}</span>
                <span className="stage-name">{stage}</span>
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
