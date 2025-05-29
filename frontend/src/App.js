import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import ActivityHistory from './components/ActivityHistory';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>Loading CodePets...</p>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated && <Header />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <ActivityHistory />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
