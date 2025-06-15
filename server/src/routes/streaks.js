import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getUserStreak, getStreakLeaderboard } from "../utils/streaks.js";

const router = express.Router();

// Get current user's streak information
router.get("/", authenticateToken, async (req, res) => {
  try {
    const streakData = await getUserStreak(req.user._id);

    res.json({
      success: true,
      streak: streakData,
    });
  } catch (error) {
    console.error("Get streak error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get streak data",
    });
  }
});

// Get streak leaderboard
router.get("/leaderboard", authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const leaderboard = await getStreakLeaderboard(limit);

    res.json({
      success: true,
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error) {
    console.error("Get streak leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get streak leaderboard",
    });
  }
});

export default router;
