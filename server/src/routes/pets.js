import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import Pet from "../models/Pet.js";
import TimeLog from "../models/TimeLog.js";

const router = express.Router();

// Get user's pet
router.get("/", authenticateToken, async (req, res) => {
  try {
    let pet = await Pet.findOne({ userId: req.user._id });

    if (!pet) {
      pet = new Pet({
        userId: req.user._id,
        name: `${req.user.username}'s Coding Cat`,
      });
      await pet.save();
    }

    res.json({
      success: true,
      pet: {
        ...pet.toObject(),
        progress: pet.getProgressToNextLevel(),
      },
    });
  } catch (error) {
    console.error("Get pet error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pet data",
    });
  }
});

// Log coding time
router.post("/log-time", authenticateToken, async (req, res) => {
  try {
    const { hours, description } = req.body;

    if (!hours || hours <= 0 || hours > 24) {
      return res.status(400).json({
        success: false,
        message: "Hours must be between 0.1 and 24",
      });
    }

    // Create time log
    const timeLog = new TimeLog({
      userId: req.user._id,
      hours: parseFloat(hours),
      description: description || "",
    });
    await timeLog.save();

    // Update pet
    let pet = await Pet.findOne({ userId: req.user._id });
    if (!pet) {
      pet = new Pet({
        userId: req.user._id,
        name: `${req.user.username}'s Coding Cat`,
      });
    }

    pet.timePoints += timeLog.points;
    pet.totalHours += timeLog.hours;
    pet.updatePoints();
    await pet.save();

    res.json({
      success: true,
      message: "Time logged successfully",
      pet: {
        ...pet.toObject(),
        progress: pet.getProgressToNextLevel(),
      },
      pointsEarned: timeLog.points,
    });  } catch (error) {
    console.error("Log time error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to log time",
    });
  }
});

// Get user's history and statistics
router.get("/history", authenticateToken, async (req, res) => {
  try {
    // Get pet data
    const pet = await Pet.findOne({ userId: req.user._id });
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pet not found",
      });
    }

    // Get recent time logs (last 10)
    const timeLogs = await TimeLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    // Calculate weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const thisWeekLogs = await TimeLog.find({
      userId: req.user._id,
      date: { $gte: weekAgo }
    }).lean();

    const thisWeekHours = thisWeekLogs.reduce((sum, log) => sum + log.hours, 0);

    // Create mock commit history (since we don't store individual syncs)
    const commitHistory = [];
    if (pet.totalCommits > 0) {
      commitHistory.push({
        date: pet.lastActivity,
        newCommits: pet.totalCommits,
        pointsEarned: pet.commitPoints
      });
    }

    const historyData = {
      stats: {
        totalCommits: pet.totalCommits,
        totalHours: pet.totalHours,
        totalPoints: pet.totalPoints,
        commitPoints: pet.commitPoints,
        timePoints: pet.timePoints,
        level: pet.level,
        lastSync: pet.lastActivity,
        lastActivity: pet.lastActivity,
        thisWeek: {
          hours: Math.round(thisWeekHours * 10) / 10,
          commits: 0 // We don't track weekly commits separately
        }
      },
      timeLogs: timeLogs,
      commitHistory: commitHistory
    };

    res.json({
      success: true,
      data: historyData,
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get history data",
    });
  }
});

// Test authentication endpoint
router.get("/test-auth", authenticateToken, async (req, res) => {
  res.json({
    success: true,
    message: "Authentication working",
    user: {
      id: req.user._id,
      username: req.user.username
    }
  });
});

export default router;
