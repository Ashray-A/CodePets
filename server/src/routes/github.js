import express from "express";
import axios from "axios";
import { authenticateTokenWithGitHub } from "../middleware/auth.js";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import CommitSync from "../models/CommitSync.js";
import { updateUserStreak } from "../utils/streaks.js";

const router = express.Router();

// Get user's GitHub repositories
router.get("/repos", authenticateTokenWithGitHub, async (req, res) => {
  try {
    const user = req.user; // Already includes accessToken from middleware
    if (!user.accessToken) {
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
router.post("/sync-commits", authenticateTokenWithGitHub, async (req, res) => {
  try {
    console.log(`🔄 Starting sync for user: ${req.user.username}`);

    const user = req.user; // Already includes accessToken from middleware
    if (!user.accessToken) {
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
    let since;
    let isNewUser = false;

    if (user.lastSynced) {
      // Existing user - sync since last sync
      since = user.lastSynced.toISOString();
    } else {
      // New user - get commits from last 30 days to give initial points
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      since = thirtyDaysAgo.toISOString();
      isNewUser = true;
    }

    console.log(`📅 Checking commits since: ${since}`);
    console.log(`👤 User: ${user.username} (${user.email})`);
    console.log(
      `🆕 ${isNewUser ? "New user - starting fresh" : "Existing user"}`
    );
    console.log(`📦 Found ${reposResponse.data.length} repositories`); // Get commits from each repository
    for (const repo of reposResponse.data) {
      try {
        console.log(`🔄 Checking repo: ${repo.full_name}`);

        // First try with author parameter
        let commitsResponse = await axios.get(
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

        let repoCommits = commitsResponse.data.length;

        // If no commits found with author filter, try without filter and manually check
        if (repoCommits === 0) {
          console.log(
            `� No commits found with author filter, checking manually...`
          );

          commitsResponse = await axios.get(
            `https://api.github.com/repos/${repo.full_name}/commits`,
            {
              headers: {
                Authorization: `token ${user.accessToken}`,
                Accept: "application/vnd.github.v3+json",
              },
              params: {
                since: since,
                per_page: 100,
              },
            }
          );

          // Manually filter commits by checking author and committer
          const userCommits = commitsResponse.data.filter((commit) => {
            const isAuthor = commit.author?.login === user.username;
            const isCommitter = commit.committer?.login === user.username;
            const isAuthorByEmail = commit.commit.author.email === user.email;
            const isCommitterByEmail =
              commit.commit.committer.email === user.email;

            return (
              isAuthor || isCommitter || isAuthorByEmail || isCommitterByEmail
            );
          });

          repoCommits = userCommits.length;

          if (repoCommits > 0) {
            console.log(
              `🎯 Found ${repoCommits} commits after manual filtering`
            );
            console.log(
              `📝 Sample commit authors:`,
              userCommits.slice(0, 3).map((c) => ({
                author: c.author?.login,
                committer: c.committer?.login,
                authorEmail: c.commit.author.email,
                committerEmail: c.commit.committer.email,
              }))
            );
          }
        }

        console.log(`📊 Found ${repoCommits} new commits in ${repo.full_name}`);
        totalNewCommits += repoCommits;
      } catch (repoError) {
        // Skip repos that we can't access (403/404)
        if (
          repoError.response?.status !== 403 &&
          repoError.response?.status !== 404
        ) {
          console.error(
            `❌ Error fetching commits for ${repo.full_name}:`,
            repoError.message
          );
        } else {
          console.log(
            `⚠️ Skipping ${repo.full_name} (${repoError.response?.status})`
          );
        }
      }
    }
    console.log(`🎯 Total new commits found: ${totalNewCommits}`); // Only update pet and record sync if there are actually new commits
    if (totalNewCommits > 0) {
      // Update user streak for coding activity
      await updateUserStreak(user._id);

      // Update or create pet
      let pet = await Pet.findOne({ userId: user._id });
      if (!pet) {
        pet = new Pet({
          userId: user._id,
          name: `${user.username}'s Coding Cat`,
        });
      }

      // Add new commit points (0.5 points per commit as per project plan)
      const newCommitPoints = totalNewCommits * 0.5;
      pet.commitPoints += newCommitPoints;
      pet.totalCommits += totalNewCommits;
      pet.updatePoints();
      await pet.save();

      // Record sync event
      const commitSync = new CommitSync({
        userId: user._id,
        newCommits: totalNewCommits,
        pointsEarned: newCommitPoints,
      });
      await commitSync.save();

      console.log(
        `💾 Recorded sync event - ${totalNewCommits} commits, ${newCommitPoints} points`
      );
    } else {
      console.log(
        `📝 No new commits found, no pet update or sync event recorded`
      );
    } // Always update user's last sync time (even if no commits found)
    // We need to update the database record, not just the req.user object
    await User.findByIdAndUpdate(user._id, { lastSynced: new Date() });
    console.log(
      `✅ Sync complete: ${totalNewCommits} commits, ${
        totalNewCommits > 0 ? totalNewCommits * 0.5 : 0
      } points earned`
    );

    // Get pet data for response (even if not updated)
    let pet = await Pet.findOne({ userId: user._id });
    if (!pet) {
      pet = new Pet({
        userId: user._id,
        name: `${user.username}'s Coding Cat`,
      });
      await pet.save();
    }

    const responseMessage = isNewUser
      ? "Sync baseline established! Future commits will earn points."
      : "GitHub commits synced successfully";

    res.json({
      success: true,
      message: responseMessage,
      newCommits: totalNewCommits,
      pointsEarned: totalNewCommits * 0.5,
      isNewUser: isNewUser,
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
router.get("/stats", authenticateTokenWithGitHub, async (req, res) => {
  try {
    const user = req.user; // Already includes accessToken from middleware
    if (!user.accessToken) {
      return res.status(400).json({
        success: false,
        message: "GitHub access token not found",
      });
    }

    // Get recent commit syncs for stats
    const recentSyncs = await CommitSync.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate total commits and points
    const totalCommits = await CommitSync.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: "$newCommits" } } },
    ]);

    const totalPoints = await CommitSync.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: "$pointsEarned" } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalCommits: totalCommits.length > 0 ? totalCommits[0].total : 0,
        totalPoints: totalPoints.length > 0 ? totalPoints[0].total : 0,
        lastSynced: user.lastSynced,
        recentSyncs: recentSyncs.map((sync) => ({
          commits: sync.newCommits,
          points: sync.pointsEarned,
          date: sync.createdAt,
        })),
      },
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
