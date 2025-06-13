import express from "express";
import axios from "axios";
import { authenticateToken } from "../middleware/auth.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import CommitSync from "../models/CommitSync.js";

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
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last 30 days if never synced

    console.log(
      `🔍 Sync: Checking commits since ${since} for user ${user.username}`
    );
    console.log(`👤 Sync: User email: ${user.email}`);
    console.log(`📦 Sync: Found ${reposResponse.data.length} repositories`);

    // Get commits from each repository
    for (const repo of reposResponse.data) {
      try {
        console.log(`🔄 Sync: Checking repo ${repo.full_name}...`);

        const commitsResponse = await axios.get(
          `https://api.github.com/repos/${repo.full_name}/commits`,
          {
            headers: {
              Authorization: `token ${user.accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
            params: {
              author: user.username, // GitHub username as author
              since: since,
              per_page: 100,
            },
          }
        );

        console.log(
          `📊 Sync: ${repo.full_name} - ${commitsResponse.data.length} commits found`
        );
        totalNewCommits += commitsResponse.data.length;
      } catch (repoError) {
        // Skip repos that we can't access (403/404)
        if (
          repoError.response?.status !== 403 &&
          repoError.response?.status !== 404
        ) {
          console.error(
            `❌ Sync: Error fetching commits for ${repo.full_name}:`,
            repoError.response?.status,
            repoError.message
          );
        } else {
          console.log(
            `⚠️ Sync: Skipping ${repo.full_name} (${repoError.response?.status})`
          );
        }
      }
    }

    console.log(`🎯 Sync: Total new commits found: ${totalNewCommits}`);

    // Update or create pet
    let pet = await Pet.findOne({ userId: user._id });
    if (!pet) {
      pet = new Pet({
        userId: user._id,
        name: `${user.username}'s Coding Cat`,
      });
    } // Add new commit points
    const newCommitPoints = totalNewCommits * 0.5; // 0.5 points per commit
    pet.commitPoints += newCommitPoints;
    pet.totalCommits += totalNewCommits;
    pet.updatePoints();
    await pet.save(); // Record sync event if there were new commits
    if (totalNewCommits > 0) {
      const commitSync = new CommitSync({
        userId: user._id,
        newCommits: totalNewCommits,
        pointsEarned: newCommitPoints,
      });
      await commitSync.save();
      console.log(
        `💾 Sync: Recorded sync event - ${totalNewCommits} commits, ${newCommitPoints} points`
      );
    } else {
      console.log(`📝 Sync: No new commits found, no sync event recorded`);
    }

    // Update user's last sync time
    user.lastSynced = new Date();
    await user.save();

    console.log(
      `✅ Sync: Complete for ${user.username} - ${totalNewCommits} commits, ${newCommitPoints} points`
    );

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

// Debug endpoint to check sync status
router.get("/sync-debug", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.accessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub access token not found",
      });
    }

    const since = user.lastSynced
      ? user.lastSynced.toISOString()
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get user's repositories
    const reposResponse = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        visibility: "public",
        per_page: 10, // Limit for debugging
      },
    });

    const debugInfo = {
      user: {
        username: user.username,
        email: user.email,
        lastSynced: user.lastSynced,
        since: since,
      },
      repos: reposResponse.data.map((repo) => ({
        name: repo.full_name,
        visibility: repo.visibility,
        defaultBranch: repo.default_branch,
      })),
    };

    res.json({
      success: true,
      debug: debugInfo,
    });
  } catch (error) {
    console.error("GitHub sync debug error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get sync debug info",
      error: error.message,
    });
  }
});

// Debug route to check commit sync info
router.get("/debug-sync", authenticateToken, async (req, res) => {
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
        per_page: 5, // Just check first 5 repos for debugging
      },
    });

    const since = user.lastSynced
      ? user.lastSynced.toISOString()
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const debugInfo = {
      user: {
        username: user.username,
        email: user.email,
        lastSynced: user.lastSynced,
      },
      since: since,
      repos: [],
    };

    // Check first few repos
    for (const repo of reposResponse.data.slice(0, 3)) {
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
              per_page: 10,
            },
          }
        );

        debugInfo.repos.push({
          name: repo.full_name,
          commits: commitsResponse.data.length,
          commitDetails: commitsResponse.data.map((c) => ({
            sha: c.sha.substring(0, 7),
            message: c.commit.message.substring(0, 50),
            date: c.commit.author.date,
            author: c.commit.author.name,
          })),
        });
      } catch (error) {
        debugInfo.repos.push({
          name: repo.full_name,
          error: error.response?.status || error.message,
        });
      }
    }

    res.json({
      success: true,
      debug: debugInfo,
    });
  } catch (error) {
    console.error("Debug sync error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get sync debug info",
      error: error.message,
    });
  }
});

export default router;
