import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const addNotification = useCallback(
    (notification) => {
      const id = Date.now() + Math.random();
      const newNotification = {
        id,
        ...notification,
        timestamp: new Date().toISOString(),
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove notification after duration
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(id);
      }, duration);

      return id;
    },
    [removeNotification]
  );

  const showAchievementToast = useCallback(
    (achievement) => {
      return addNotification({
        type: "achievement",
        title: "Achievement Unlocked!",
        message: achievement.name,
        description: achievement.description,
        icon: achievement.icon || "🏆",
        duration: 6000,
      });
    },
    [addNotification]
  );

  const showEvolutionToast = useCallback(
    (evolution) => {
      return addNotification({
        type: "evolution",
        title: "Pet Evolved!",
        message: `Your pet evolved to ${evolution.newStage}!`,
        description: evolution.description,
        icon: evolution.emoji || "✨",
        oldStage: evolution.oldStage,
        newStage: evolution.newStage,
        duration: 8000,
      });
    },
    [addNotification]
  );

  const showSuccessToast = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: "success",
        title: "Success!",
        message,
        icon: "✅",
        duration: 3000,
        ...options,
      });
    },
    [addNotification]
  );

  const showErrorToast = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: "error",
        title: "Error",
        message,
        icon: "❌",
        duration: 5000,
        ...options,
      });
    },
    [addNotification]
  );

  const showInfoToast = useCallback(
    (message, options = {}) => {
      return addNotification({
        type: "info",
        title: "Info",
        message,
        icon: "ℹ️",
        duration: 4000,
        ...options,
      });
    },
    [addNotification]
  );

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showAchievementToast,
    showEvolutionToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
