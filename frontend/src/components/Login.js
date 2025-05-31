import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

function Login() {
  const { loginWithGitHub } = useAuth();
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    { emoji: "🥚", name: "Egg", description: "Your journey begins" },
    { emoji: "🐣", name: "Hatching", description: "First steps in coding" },
    { emoji: "🐤", name: "Baby", description: "Learning the basics" },
    { emoji: "🐥", name: "Juvenile", description: "Building skills" },
    { emoji: "🦆", name: "Teen", description: "Growing confidence" },
    { emoji: "🦢", name: "Young Adult", description: "Mastering concepts" },
    { emoji: "🦅", name: "Adult", description: "Professional level" },
    { emoji: "🦉", name: "Elder", description: "Wisdom achieved" },
    { emoji: "🐲", name: "Legendary", description: "Coding master" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % stages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="bg-animation">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`floating-code floating-code-${i + 1}`}>
            {["<>", "{}", "[]", "()", "&&", "||", "=>", "++"][i % 8]}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="login-content">
        {" "}
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            Code<span className="gradient-text">Pets</span>
          </h1>
          <p className="hero-subtitle">
            Transform your coding journey into an adventure.
            <br />
            Watch your digital companion evolve as you grow as a developer.
          </p>
        </div>
        {/* Evolution Showcase */}
        <div className="evolution-showcase">
          <div className="showcase-header">
            <h2 className="showcase-title">9 Stages of Evolution</h2>
            <p className="showcase-subtitle">
              Your pet grows with every commit, every project, every line of
              code
            </p>
          </div>

          <div className="evolution-grid">
            {stages.map((stage, index) => (
              <div
                key={index}
                className={`evolution-item ${
                  index === activeStage ? "active" : ""
                } ${index < activeStage ? "completed" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="evolution-icon">{stage.emoji}</div>
                <div className="evolution-info">
                  <h3 className="evolution-name">{stage.name}</h3>
                  <p className="evolution-desc">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Login Card */}
        <div className="login-card">
          <div className="card-header">
            <h3>Ready to start your journey?</h3>
            <p>Connect with GitHub to begin growing your CodePet</p>
          </div>

          <button className="github-btn" onClick={loginWithGitHub}>
            <div className="btn-content">
              <svg
                className="github-icon"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="currentColor"
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
              <span>Continue with GitHub</span>
            </div>
          </button>

          <div className="privacy-note">
            <span className="security-icon">🔒</span>
            <p>
              We only access your public repositories and commit history to
              track your coding progress. Your privacy is protected.
            </p>
          </div>
        </div>
        {/* Features */}
        <div className="features-section">
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h4>Track Progress</h4>
            <p>Monitor coding activity</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🏆</div>
            <h4>Earn Achievements</h4>
            <p>Unlock special rewards</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔥</div>
            <h4>Build Streaks</h4> <p>Maintain consistency</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
