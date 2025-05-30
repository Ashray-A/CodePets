import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./AuthCallback.css";

const AuthCallback = () => {
  const { handleGitHubCallback } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // Prevent multiple executions
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      try {
        // Extract code and state from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");
        const error = urlParams.get("error");

        console.log("AuthCallback: Processing callback with params:", {
          code: code ? "present" : "missing",
          state: state ? "present" : "missing",
          error: error,
        });
        if (error) {
          throw new Error(`GitHub OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error("No authorization code received");
        }

        // Clean the URL immediately to prevent code reuse
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        setStatus("authenticating");
        await handleGitHubCallback(code, state);

        // Clean the URL to prevent code reuse
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        setStatus("success");

        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(err.message || "Authentication failed");
        setStatus("error");
      }
    };

    processCallback();
  }, [handleGitHubCallback, navigate]);
  const renderContent = () => {
    switch (status) {
      case "processing":
        return (
          <div className="auth-content">
            <div className="auth-spinner"></div>
            <h2 className="auth-title">
              Processing your GitHub authorization...
            </h2>
            <p className="auth-description">
              Please wait while we set up your account.
            </p>
          </div>
        );

      case "authenticating":
        return (
          <div className="auth-content">
            <div className="auth-spinner"></div>
            <h2 className="auth-title">Authenticating with GitHub...</h2>
            <p className="auth-description">
              Creating your digital pet companion.
            </p>
          </div>
        );

      case "success":
        return (
          <div className="auth-content">
            <div className="auth-icon">✅</div>
            <h2 className="auth-title success">Welcome to CodePets!</h2>
            <p className="auth-description">
              Your account has been created successfully.
            </p>
            <p className="auth-subdescription">
              Redirecting to your dashboard...
            </p>
          </div>
        );

      case "error":
        return (
          <div className="auth-content">
            <div className="auth-icon">❌</div>
            <h2 className="auth-title error">Authentication Failed</h2>
            <p className="auth-error-text">{error}</p>
            <button
              className="auth-return-btn"
              onClick={() => (window.location.href = "/")}
            >
              Return to Login
            </button>
          </div>
        );

      default:
        return null;
    }
  };
  return (
    <div className="auth-callback-page">
      <div className="auth-callback-card">{renderContent()}</div>
    </div>
  );
};

export default AuthCallback;
