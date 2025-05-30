import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <a href="/" className="header-logo">
          <span className="logo-icon">🐾</span>
          <span className="logo-text">CodePets</span>
        </a>

        <nav className="header-nav">
          <a href="/" className="nav-link active">Dashboard</a>
          <a href="/history" className="nav-link">Activity History</a>
          <a href="/achievements" className="nav-link">Achievements</a>
        </nav>

        <div className="user-section">
          {user && (
            <div className="user-info">
              <img 
                src={user.avatar_url || `https://github.com/${user.username}.png`} 
                alt={user.username}
                className="user-avatar"
              />
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className="user-status">Coding Enthusiast</span>
              </div>
            </div>
          )}
          
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        <button className="mobile-menu-btn">
          ☰
        </button>
      </div>
    </header>
  );
}

export default Header;