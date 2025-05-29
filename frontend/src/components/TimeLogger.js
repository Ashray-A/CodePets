import React, { useState, useEffect } from 'react';
import { activityAPI } from '../services/api';
import './TimeLogger.css';

function TimeLogger({ onActivityLogged }) {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [sessionData, setSessionData] = useState({
    language: '',
    project: '',
    description: ''
  });
  const [isLogging, setIsLogging] = useState(false);
  const [manualDuration, setManualDuration] = useState('');

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsActive(true);
    setStartTime(Date.now());
    setTime(0);
  };

  const stopTimer = () => {
    setIsActive(false);
    setStartTime(null);
  };

  const resetTimer = () => {
    setIsActive(false);
    setStartTime(null);
    setTime(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSessionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const logSession = async (duration) => {
    if (!duration || duration <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    setIsLogging(true);
    try {
      const response = await activityAPI.logManualSession({
        duration: Math.floor(duration / 60), // Convert seconds to minutes
        language: sessionData.language || 'Unknown',
        project: sessionData.project || 'Personal Project',
        description: sessionData.description || 'Coding session'
      });

      alert(`Session logged! You gained ${response.data.experienceGained} XP!`);
      
      // Reset form
      setSessionData({
        language: '',
        project: '',
        description: ''
      });
      resetTimer();
      setManualDuration('');
      
      // Notify parent component
      if (onActivityLogged) {
        onActivityLogged(response.data);
      }

    } catch (error) {
      console.error('Failed to log session:', error);
      alert('Failed to log session. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const logTimerSession = () => {
    logSession(time);
  };

  const logManualSession = () => {
    const duration = parseInt(manualDuration) * 60; // Convert minutes to seconds
    logSession(duration);
  };  return (
    <div className="time-logger">
      <div className="timer-section">
        <h3 className="section-title">
          ⏱️ <span>Timer</span>
        </h3>
        <div className="timer-display">
          <div className="timer-time">
            {formatTime(time)}
          </div>
          <div className="timer-controls">
            {!isActive ? (
              <button 
                onClick={startTimer} 
                className="timer-btn timer-btn--start"
              >
                ▶️ <span>Start Coding</span>
              </button>
            ) : (
              <button 
                onClick={stopTimer} 
                className="timer-btn timer-btn--stop"
              >
                ⏹️ <span>Stop</span>
              </button>
            )}
            <button 
              onClick={resetTimer} 
              className="timer-btn timer-btn--reset"
            >
              🔄 <span>Reset</span>
            </button>
          </div>
        </div>
        
        {time > 0 && !isActive && (
          <div className="session-log-card">
            <h4 className="session-log-title">📝 Log this session?</h4>
            <div className="session-form">
              <input
                type="text"
                name="language"
                placeholder="Programming Language"
                value={sessionData.language}
                onChange={handleInputChange}
                className="form-input"
              />
              <input
                type="text"
                name="project"
                placeholder="Project Name"
                value={sessionData.project}
                onChange={handleInputChange}
                className="form-input"
              />
              <textarea
                name="description"
                placeholder="What did you work on?"
                value={sessionData.description}
                onChange={handleInputChange}
                rows={3}
                className="form-input form-textarea"
              />
              <button 
                onClick={logTimerSession} 
                disabled={isLogging}
                className="session-log-btn"
              >
                {isLogging ? 'Logging...' : `Log ${formatTime(time)} Session`}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="manual-section">
        <h3 className="section-title">
          ✍️ <span>Manual Entry</span>
        </h3>
        <p className="manual-description">Already coded? Log your time manually</p>
        <div className="manual-form">
          <div className="duration-input-group">
            <input
              type="number"
              placeholder="Minutes"
              value={manualDuration}
              onChange={(e) => setManualDuration(e.target.value)}
              min="1"
              max="480"
              className="form-input duration-input"
            />
            <span className="duration-label">minutes</span>
          </div>
          <input
            type="text"
            name="language"
            placeholder="Programming Language"
            value={sessionData.language}
            onChange={handleInputChange}
            className="form-input"
          />
          <input
            type="text"
            name="project"
            placeholder="Project Name"
            value={sessionData.project}
            onChange={handleInputChange}
            className="form-input"
          />
          <textarea
            name="description"
            placeholder="What did you work on?"
            value={sessionData.description}
            onChange={handleInputChange}
            rows={3}
            className="form-input form-textarea"
          />
          <button 
            onClick={logManualSession} 
            disabled={isLogging || !manualDuration}
            className="manual-log-btn"
          >
            {isLogging ? 'Logging...' : 'Log Manual Session'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimeLogger;
