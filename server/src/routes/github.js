import express from "express";
import axios from "axios";
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";

const router = express.Router();

// Get user's GitHub repositories
router.get("/repos", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.accessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub access token not found",
      });
    }

    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        visibility: "public",
        sort: "updated",
        per_page: 100,
      },
    });

    const repos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
    }));

    res.json({
      success: true,
      repos,
      total: repos.length,
    });
  } catch (error) {
    console.error("GitHub repos error:", error);

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "GitHub access token expired or invalid",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch GitHub repositories",
    });
  }
});

// Sync commits and update pet
router.post("/sync-commits", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.accessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub access token not found",
      });
    }

    // Get user's repositories
    const reposResponse = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        visibility: "public",
        per_page: 100,
      },
    });

    let totalNewCommits = 0;
    const since = user.lastSynced
      ? user.lastSynced.toISOString()
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(); // Last year if never synced

    // Get commits from each repository
    for (const repo of reposResponse.data) {
      try {
        const commitsResponse = await axios.get(
          `https://api.github.com/repos/${repo.full_name}/commits`,
          {
            headers: {
              Authorization: `token ${user.accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
            params: {
              author: user.username,
              since: since,
              per_page: 100,
            },
          }
        );

        totalNewCommits += commitsResponse.data.length;
      } catch (repoError) {
        // Skip repos that we can't access (403/404)
        if (
          repoError.response?.status !== 403 &&
          repoError.response?.status !== 404
        ) {
          console.error(
            `Error fetching commits for ${repo.full_name}:`,
            repoError.message
          );
        }
      }
    }

    // Update or create pet
    let pet = await Pet.findOne({ userId: user._id });
    if (!pet) {
      pet = new Pet({
        userId: user._id,
        name: `${user.username}'s Coding Cat`,
      });
    }

    // Add new commit points
    const newCommitPoints = totalNewCommits * 0.5; // 0.5 points per commit
    pet.commitPoints += newCommitPoints;
    pet.totalCommits += totalNewCommits;
    pet.updatePoints();
    await pet.save();

    // Update user's last sync time
    user.lastSynced = new Date();
    await user.save();

    res.json({
      success: true,
      message: "GitHub commits synced successfully",
      newCommits: totalNewCommits,
      pointsEarned: newCommitPoints,
      pet: {
        ...pet.toObject(),
        progress: pet.getProgressToNextLevel(),
      },
    });
  } catch (error) {
    console.error("GitHub sync error:", error);

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "GitHub access token expired or invalid",
      });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        message: "GitHub API rate limit exceeded. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to sync GitHub commits",
    });
  }
});

// Get GitHub activity stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.accessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub access token not found",
      });
    }

    // Get basic user stats from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const githubStats = {
      publicRepos: userResponse.data.public_repos,
      followers: userResponse.data.followers,
      following: userResponse.data.following,
      createdAt: userResponse.data.created_at,
      lastSynced: user.lastSynced,
    };

    res.json({
      success: true,
      stats: githubStats,
    });
  } catch (error) {
    console.error("GitHub stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch GitHub stats",
    });
  }
});

export default router;
