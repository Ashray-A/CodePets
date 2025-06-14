import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";

const router = express.Router();

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-accessToken");
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
});

// Get leaderboard
router.get("/leaderboard", authenticateToken, async (req, res) => {
  try {
    // Get all pets with user info, sorted by total points
    const leaderboard = await Pet.find({})
      .populate("userId", "username avatarUrl")
      .sort({ totalPoints: -1 })
      .limit(50)
      .lean();

    // Format the response
    const formattedLeaderboard = leaderboard
      .filter((pet) => pet.userId) // Only include pets with valid users
      .map((pet, index) => ({
        rank: index + 1,
        username: pet.userId.username,
        avatarUrl: pet.userId.avatarUrl,
        level: pet.level,
        totalPoints: pet.totalPoints,
        totalCommits: pet.totalCommits,
        totalHours: pet.totalHours,
        petName: pet.name,
      }));

    res.json({
      success: true,
      leaderboard: formattedLeaderboard,
      total: formattedLeaderboard.length,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get leaderboard",
    });
  }
});

export default router;
