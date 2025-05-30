const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    await req.user.updateActivity();

    res.json({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      githubUrl: req.user.githubUrl,
      joinedAt: req.user.joinedAt,
      lastActive: req.user.lastActive,
      totalCommits: req.user.totalCommits,
      currentStreak: req.user.currentStreak,
      longestStreak: req.user.longestStreak,
      lastCommitDate: req.user.lastCommitDate,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get user profile" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;

    if (email) {
      req.user.email = email;
    }

    await req.user.save();
    await req.user.updateActivity();

    res.json({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      githubUrl: req.user.githubUrl,
      joinedAt: req.user.joinedAt,
      lastActive: req.user.lastActive,
      totalCommits: req.user.totalCommits,
      currentStreak: req.user.currentStreak,
      longestStreak: req.user.longestStreak,
      lastCommitDate: req.user.lastCommitDate,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user profile" });
  }
});

// Get user stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const Activity = require("../models/Activity");

    // Get recent activities
    const recentActivities = await Activity.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(10);

    // Calculate weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyActivities = await Activity.find({
      userId: req.user._id,
      date: { $gte: weekAgo },
    });

    const weeklyCommits = weeklyActivities.filter(
      (a) => a.type === "commit"
    ).length;
    const weeklyCodingTime = weeklyActivities
      .filter((a) => a.type === "coding_session")
      .reduce((total, a) => total + (a.data.duration || 0), 0);

    res.json({
      totalCommits: req.user.totalCommits,
      currentStreak: req.user.currentStreak,
      longestStreak: req.user.longestStreak,
      lastCommitDate: req.user.lastCommitDate,
      weeklyCommits,
      weeklyCodingTime,
      recentActivities: recentActivities.map((a) => ({
        type: a.type,
        date: a.date,
        experience: a.experience,
        data: a.data,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get user stats" });
  }
});

module.exports = router;
