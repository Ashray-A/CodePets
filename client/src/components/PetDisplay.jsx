import { useState, useEffect } from 'react';
import { petAPI } from '../utils/api';
import '../styles/components/PetDisplay.css';

const PetDisplay = () => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPet();
  }, []);

  const fetchPet = async () => {
    try {
      setLoading(true);
      const response = await petAPI.getPet();
      setPet(response.data.pet);
    } catch (error) {
      setError('Failed to load your pet');
      console.error('Pet fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCatEmoji = (level) => {
    switch (level) {
      case 1: return '🐱'; // Baby cat
      case 2: return '🐈'; // Young cat
      case 3: return '😸'; // Adult cat
      case 4: return '😺'; // Wise cat
      case 5: return '👑🐱'; // Master cat
      default: return '🐱';
    }
  };

  const getLevelName = (level) => {
    switch (level) {
      case 1: return 'Baby Cat';
      case 2: return 'Young Cat';
      case 3: return 'Adult Cat';
      case 4: return 'Wise Cat';
      case 5: return 'Master Cat';
      default: return 'Baby Cat';
    }
  };

  const getDaysSinceLastActivity = (lastActivity) => {
    if (!lastActivity) return 'Never';
    
    const now = new Date();
    const lastActiveDate = new Date(lastActivity);
    const diffTime = Math.abs(now - lastActiveDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  if (loading) return <div className="pet-loading">Loading your pet... 🐱</div>;
  if (error) return <div className="pet-error">{error}</div>;
  if (!pet) return <div className="pet-error">No pet found</div>;

  return (
    <div className="pet-display">
      <div className="pet-avatar">
        <span className="pet-emoji">{getCatEmoji(pet.level)}</span>
      </div>
      
      <div className="pet-info">
        <h2 className="pet-name">{pet.name}</h2>
        <p className="pet-level">Level {pet.level} - {getLevelName(pet.level)}</p>
        <p className="pet-points">{pet.totalPoints} total points</p>
        <p className="pet-last-active">
          Last active: {getDaysSinceLastActivity(pet.lastActivity)}
        </p>
        
        {pet.progress && !pet.progress.isMaxLevel && (
          <div className="progress-section">
            <p className="progress-text">
              {pet.progress.needed} points to level {pet.level + 1}
            </p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${pet.progress.progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {pet.progress?.isMaxLevel && (
          <p className="max-level">🎉 Max level reached!</p>
        )}
      </div>
      
      <div className="pet-stats">
        <div className="stat">
          <span className="stat-label">Commits:</span>
          <span className="stat-value">{pet.totalCommits}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Hours:</span>
          <span className="stat-value">{pet.totalHours}</span>
        </div>
      </div>
    </div>
  );
};

export default PetDisplay;
