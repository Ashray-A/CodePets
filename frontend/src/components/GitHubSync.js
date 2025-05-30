import React, { useState, useEffect, useRef } from 'react';
import GitHubService from '../services/github';
import './GitHubSync.css';

const GitHubSync = ({ onSyncComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [githubStats, setGithubStats] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const autoSyncIntervalRef = useRef(null);
  useEffect(() => {
    loadGitHubData();
    
    // Start auto-sync every 30 minutes
    const interval = setInterval(async () => {
      if (!isLoading) {
        try {
          setIsAutoSyncing(true);
          const result = await GitHubService.autoSyncCommits();
          setLastSyncTime(new Date());
          
          if (result.newCommits > 0 && onSyncComplete) {
            onSyncComplete(result);
          }
        } catch (error) {
          console.error('Auto-sync failed:', error);
        } finally {
          setIsAutoSyncing(false);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    autoSyncIntervalRef.current = interval;
    
    return () => {
      if (autoSyncIntervalRef.current) {
        clearInterval(autoSyncIntervalRef.current);
      }
    };
  }, [isLoading, onSyncComplete]);  const loadGitHubData = async () => {
    try {
      const [statsData, reposData] = await Promise.all([
        GitHubService.getGitHubStats(),
        GitHubService.getUserRepositories()
      ]);
      
      setGithubStats(statsData);
      setRepositories(reposData.repositories || []);
    } catch (error) {
      console.error('Error loading GitHub data:', error);
    }
  };
  const handleSyncCommits = async () => {
    setIsLoading(true);
    setSyncStatus(null);

    try {
      const result = await GitHubService.syncCommits();
      setSyncStatus({
        type: 'success',
        message: result.message,
        details: `Found ${result.newCommits} new commits worth ${result.totalExperience} XP!`
      });

      if (onSyncComplete) {
        onSyncComplete(result);
      }
    } catch (error) {
      setSyncStatus({
        type: 'error',
        message: 'Failed to sync commits',
        details: error.response?.data?.message || error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealtimeSync = async (forceSync = false) => {
    setIsLoading(true);
    setSyncStatus(null);

    try {
      const result = await GitHubService.syncCommitsRealtime(forceSync);
      
      if (result.newCommits === 0 && result.message.includes('Rate limited')) {
        setSyncStatus({
          type: 'warning',
          message: 'Sync rate limited',
          details: `Next sync available at ${new Date(result.nextSyncAvailable).toLocaleTimeString()}`
        });
      } else {
        setSyncStatus({
          type: 'success',
          message: result.message,
          details: `Found ${result.newCommits} new commits worth ${result.totalExperience} XP!`,
          syncLog: result.syncLog
        });
      }

      if (onSyncComplete && result.newCommits > 0) {
        onSyncComplete(result);
      }
    } catch (error) {
      setSyncStatus({
        type: 'error',
        message: 'Failed to sync commits',
        details: error.response?.data?.message || error.message,
        syncLog: error.response?.data?.syncLog
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };  return (
    <div className="github-sync">
      <div className="github-header">
        <h3 className="github-title">
          🐙 <span>GitHub Integration</span>
        </h3>
        <div className="auto-sync-status">
          <div className="auto-sync-indicator">
            <span className={isAutoSyncing ? 'auto-sync-running' : 'auto-sync-active'}>
              {isAutoSyncing ? '🔄' : '✅'}
            </span>
            <span className="auto-sync-text">
              Auto-sync: {isAutoSyncing ? 'Running...' : 'Active'}
            </span>
          </div>
          {lastSyncTime && (
            <span className="last-sync-time">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="sync-actions">
        <button 
          onClick={handleSyncCommits}
          disabled={isLoading}
          className="sync-btn sync-btn--full"
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className="loading-spinner"></div>
              Syncing...
            </span>
          ) : (
            <>
              🔄 <span>Full Sync</span>
            </>
          )}
        </button>
        <button 
          onClick={() => handleRealtimeSync(false)}
          disabled={isLoading}
          className="sync-btn sync-btn--quick"
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className="loading-spinner"></div>
              Syncing...
            </span>
          ) : (
            <>
              ⚡ <span>Quick Sync</span>
            </>
          )}
        </button>
      </div>

      {syncStatus && (
        <div className={`sync-status sync-status--${syncStatus.type}`}>
          <div className={`sync-status-message sync-status-message--${syncStatus.type}`}>
            {syncStatus.message}
          </div>
          <div className="sync-status-details">{syncStatus.details}</div>
          {syncStatus.syncLog && (
            <div className="sync-log">
              <h5 className="sync-log-title">Sync Details:</h5>
              <div className="sync-log-entries">
                {syncStatus.syncLog.map((entry, index) => (
                  <div key={index} className="sync-log-entry">
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {githubStats && (
        <div className="stats-card">
          <h4 className="stats-title">
            📊 <span>GitHub Profile Stats</span>
          </h4>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{githubStats.githubProfile.publicRepos}</div>
              <div className="stat-label">Public Repos</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{githubStats.githubProfile.followers}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{githubStats.githubProfile.following}</div>
              <div className="stat-label">Following</div>
            </div>
            <div className="stat-item">
              <div className="stat-date">{formatDate(githubStats.githubProfile.createdAt)}</div>
              <div className="stat-label">Joined GitHub</div>
            </div>
          </div>
        </div>
      )}

      {repositories.length > 0 && (
        <div className="repos-card">
          <h4 className="repos-title">
            📁 <span>Recent Repositories</span>
          </h4>
          <div className="repos-list">
            {repositories.slice(0, 5).map(repo => (
              <div key={repo.id} className="repo-item">
                <div className="repo-header">
                  <div>
                    <a 
                      href={repo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="repo-name"
                    >
                      {repo.name}
                    </a>
                    <div className="repo-meta">
                      {repo.language && (
                        <span className="repo-language">
                          {repo.language}
                        </span>
                      )}
                      <span className="repo-stars">
                        ⭐ {repo.stars}
                      </span>
                      <span className="repo-updated">
                        Updated {formatDate(repo.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubSync;
