import React from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

function Login() {
  const { loginWithGitHub } = useAuth();

  return (
    <div className="login-container">
      {/* Animated background elements */}
      <div className="background-particles">
        <div className="particle particle-1">🌟</div>
        <div className="particle particle-2">✨</div>
        <div className="particle particle-3">🌟</div>
        <div className="particle particle-4">✨</div>
        <div className="particle particle-5">🌟</div>
        <div className="particle particle-6">✨</div>
      </div>
      <div className="login-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-line-1">Welcome to</span>
            <span className="title-line-2">
              <span className="code-text">&lt;Code</span>
              <span className="pets-text">Pets</span>
              <span className="code-text">/&gt;</span>
            </span>
          </h1>

          <p className="hero-subtitle">
            Transform your coding journey into an epic adventure where every
            commit, every line of code, and every project helps your digital
            companion grow stronger and evolve into legendary forms.
          </p>
        </div>
      </div>

      <div className="login-card">
        <div className="card-glow"></div>

        <div className="login-content">
          {" "}
          <div className="evolution-showcase">
            <h3 className="showcase-title">Evolution Journey</h3>
            <div className="evolution-timeline">
              <div className="timeline-stage">
                <div className="stage-icon">🥚</div>
                <span className="stage-name">egg</span>
              </div>
              <div className="timeline-connector"></div>
              <div className="timeline-stage">
                <div className="stage-icon">🐣</div>
                <span className="stage-name">baby</span>
              </div>
              <div className="timeline-connector"></div>
              <div className="timeline-stage">
                <div className="stage-icon">🐤</div>
                <span className="stage-name">teen</span>
              </div>
              <div className="timeline-connector"></div>
              <div className="timeline-stage">
                <div className="stage-icon">🐦</div>
                <span className="stage-name">junior</span>
              </div>
              <div className="timeline-connector"></div>
              <div className="timeline-stage">
                <div className="stage-icon">🦅</div>
                <span className="stage-name">adult</span>
              </div>
            </div>

            <div className="evolution-more">
              <span className="more-text">+ 4 more legendary stages</span>
              <div className="legendary-stages">
                <div className="legendary-stage">
                  <div className="stage-icon">🦉</div>
                  <span className="stage-name">senior</span>
                </div>
                <div className="legendary-stage">
                  <div className="stage-icon">🦚</div>
                  <span className="stage-name">veteran</span>
                </div>
                <div className="legendary-stage">
                  <div className="stage-icon">🐉</div>
                  <span className="stage-name">master</span>
                </div>
                <div className="legendary-stage">
                  <div className="stage-icon">👑</div>
                  <span className="stage-name">legendary</span>
                </div>
              </div>
            </div>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h4>Track Progress</h4>
              <p>Monitor your coding activity and watch your stats grow</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h4>Earn Achievements</h4>
              <p>Unlock badges and milestones as you code</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h4>Level Up</h4>
              <p>Gain XP and evolve your pet through 9 stages</p>
            </div>
          </div>
          <div className="login-actions">
            <button className="github-login-btn" onClick={loginWithGitHub}>
              <div className="btn-background"></div>
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
              <span className="btn-text">Start Your Journey with GitHub</span>
              <div className="btn-shine"></div>
            </button>

            <div className="privacy-note">
              <div className="privacy-icon">🔒</div>
              <p>
                Secure GitHub integration • We only access public repositories •
                Your privacy matters to us
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
