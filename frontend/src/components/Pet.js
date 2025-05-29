import React from 'react';
import './Pet.css';

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
      egg: '🥚',
      baby: '🐣',
      teen: '🐤',
      adult: '🐥', 
      master: '🦅'
    };
    return emojis[stage] || '🥚';
  };

  const getPetDetails = (stage) => {
    const details = {
      egg: { emoji: '🥚', name: 'Mysterious Egg', description: 'A coding adventure waiting to hatch!' },
      baby: { emoji: '🐣', name: 'Code Chick', description: 'Just hatched and ready to learn!' },
      teen: { emoji: '🐤', name: 'Dev Duckling', description: 'Growing stronger with each commit!' },
      adult: { emoji: '🐥', name: 'Code Bird', description: 'A skilled programmer taking flight!' },
      master: { emoji: '🦅', name: 'Code Eagle', description: 'Master of the coding skies!' }
    };
    return details[stage] || details.egg;
  };

  const getProgressPercentage = (current, max) => {
    return Math.min((current / max) * 100, 100);
  };

  const getNextThreshold = () => {
    const thresholds = pet.stageThresholds || {
      egg: 0,
      baby: 100,
      teen: 500,
      adult: 1500,
      master: 3000
    };
    
    const stages = ['egg', 'baby', 'teen', 'adult', 'master'];
    const currentIndex = stages.indexOf(pet.stage);
    const nextStage = stages[currentIndex + 1];
    
    return nextStage ? thresholds[nextStage] : thresholds.master;
  };

  const getStageStatus = (stage) => {
    const thresholds = pet.stageThresholds || {
      egg: 0,
      baby: 100,
      teen: 500,
      adult: 1500,
      master: 3000
    };
    
    if (pet.experience >= thresholds[stage]) {
      return pet.stage === stage ? 'current' : 'completed';
    }
    return 'locked';
  };
  return (
    <div className="pet-container">
      <div className="pet-display">
        <div className="pet-avatar">
          <div className="pet-glow"></div>
          <span className="pet-emoji">{getPetDetails(pet.stage).emoji}</span>
        </div>
        <div className="pet-info">
          <h2 className="pet-name">{pet.name || getPetDetails(pet.stage).name}</h2>
          <p className="pet-stage">{getPetDetails(pet.stage).description}</p>
          <div className="pet-level">
            <span className="level-badge">Level {pet.stage}</span>
          </div>
        </div>
      </div>      <div className="pet-stats">
        <div className="stat-card experience">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Coding Experience</div>
            <div className="stat-value">
              <span className="current-xp">{pet.experience}</span>
              <span className="xp-separator">/</span>
              <span className="target-xp">{getNextThreshold()}</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill experience"
                  style={{ 
                    width: `${getProgressPercentage(pet.experience, getNextThreshold())}%` 
                  }}
                ></div>
              </div>
              <div className="progress-text">
                {Math.round(getProgressPercentage(pet.experience, getNextThreshold()))}% to next evolution
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="growth-stages">
        <div className="growth-header">
          <h3 className="growth-title">
            Evolution Timeline
          </h3>
        </div>
        <div className="stages-container">
          {['egg', 'baby', 'teen', 'adult', 'master'].map((stage, index, array) => (
            <React.Fragment key={stage}>
              <div className={`stage-item ${getStageStatus(stage)}`}>
                <div className="stage-icon-container">
                  <span className="stage-emoji">{getPetEmoji(stage)}</span>
                  {getStageStatus(stage) === 'current' && (
                    <div className="current-indicator">
                      <span className="pulse-ring"></span>
                      <span className="pulse-dot"></span>
                    </div>
                  )}
                  {getStageStatus(stage) === 'completed' && (
                    <div className="completed-check">✓</div>
                  )}
                </div>
                <span className="stage-name">{getPetDetails(stage).name}</span>
                <span className="stage-description">{stage} stage</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pet;