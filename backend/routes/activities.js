const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Activity = require("../models/Activity");
const Pet = require("../models/Pet");
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

// Get user's activities
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const filter = { userId: req.user._id };
    if (type) {
      filter.type = type;
    }

    const activities = await Activity.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(filter);

    res.json({
      activities: activities.map((a) => ({
        id: a._id,
        type: a.type,
        data: a.data,
        experience: a.experience,
        date: a.date,
        processed: a.processed,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get activities" });
  }
});

// Manually log coding time
router.post("/manual-log", authenticateToken, async (req, res) => {
  try {
    const { duration, language, project, description } = req.body;

    if (!duration || duration <= 0) {
      return res
        .status(400)
        .json({ message: "Duration must be a positive number" });
    }

    if (duration > 480) {
      // Max 8 hours per session
      return res
        .status(400)
        .json({ message: "Duration cannot exceed 8 hours (480 minutes)" });
    }

    const activity = new Activity({
      userId: req.user._id,
      type: "coding_session",
      data: {
        duration: parseInt(duration),
        language: language || "Unknown",
        project: project || "Personal Project",
        description: description || "Manual coding session",
      },
    });

    await activity.save();

    // Add experience to pet
    const pet = await Pet.findOne({ userId: req.user._id });
    if (pet) {
      await pet.addExperience(activity.experience);

      // Update pet stats
      pet.stats.totalCodingTime += activity.data.duration;

      // Update language stats
      const langIndex = pet.stats.languagesUsed.findIndex(
        (l) => l.name === activity.data.language
      );
      if (langIndex >= 0) {
        pet.stats.languagesUsed[langIndex].count += 1;
      } else {
        pet.stats.languagesUsed.push({
          name: activity.data.language,
          count: 1,
        });
      }

      await pet.save();
    }

    activity.processed = true;
    await activity.save();

    res.json({
      message: "Coding session logged successfully!",
      activity: {
        id: activity._id,
        type: activity.type,
        data: activity.data,
        experience: activity.experience,
        date: activity.date,
      },
      experienceGained: activity.experience,
    });
  } catch (error) {
    console.error("Manual log error:", error);
    res.status(500).json({ message: "Failed to log coding session" });
  }
});

// Get activity stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const { period = "week" } = req.query; // week, month, year

    let startDate;
    const now = new Date();

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const activities = await Activity.find({
      userId: req.user._id,
      date: { $gte: startDate },
    });

    const stats = {
      totalActivities: activities.length,
      totalExperience: activities.reduce((sum, a) => sum + a.experience, 0),
      commits: activities.filter((a) => a.type === "commit").length,
      codingSessions: activities.filter((a) => a.type === "coding_session")
        .length,
      totalCodingTime: activities
        .filter((a) => a.type === "coding_session")
        .reduce((sum, a) => sum + (a.data.duration || 0), 0),
      languageBreakdown: {},
      dailyActivity: {},
    };

    // Calculate language breakdown
    activities.forEach((activity) => {
      if (activity.data.language) {
        stats.languageBreakdown[activity.data.language] =
          (stats.languageBreakdown[activity.data.language] || 0) + 1;
      }
    });

    // Calculate daily activity
    activities.forEach((activity) => {
      const day = activity.date.toISOString().split("T")[0];
      if (!stats.dailyActivity[day]) {
        stats.dailyActivity[day] = { commits: 0, codingTime: 0, experience: 0 };
      }

      if (activity.type === "commit") {
        stats.dailyActivity[day].commits++;
      } else if (activity.type === "coding_session") {
        stats.dailyActivity[day].codingTime += activity.data.duration || 0;
      }

      stats.dailyActivity[day].experience += activity.experience;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to get activity stats" });
  }
});

// Enhanced GitHub commit syncing with multiple data sources
router.post("/sync-github", authenticateToken, async (req, res) => {
  try {
    if (!req.user.accessToken) {
      return res.status(400).json({ message: "GitHub access token not found" });
    }

    let totalNewCommits = 0;
    let totalExperience = 0;
    const syncResults = {
      fromEvents: 0,
      fromRepos: 0,
      errors: [],
    };

    // Method 1: Get commits from user events (faster, covers recent activity)
    try {
      const eventsResponse = await axios.get(
        "https://api.github.com/user/events",
        {
          headers: {
            Authorization: `token ${req.user.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
          params: {
            per_page: 100,
          },
        }
      );

      const events = eventsResponse.data;

      for (const event of events) {
        if (event.type === "PushEvent" && event.payload.commits) {
          for (const commit of event.payload.commits) {
            // Check if we already have this commit
            const existingActivity = await Activity.findOne({
              userId: req.user._id,
              type: "commit",
              "data.commitHash": commit.sha,
            });

            if (!existingActivity) {
              // Get detailed commit info for better XP calculation
              let commitDetails = null;
              try {
                const detailResponse = await axios.get(commit.url, {
                  headers: { Authorization: `token ${req.user.accessToken}` },
                });
                commitDetails = detailResponse.data;
              } catch (detailError) {
                console.warn(
                  `Could not get commit details for ${commit.sha}:`,
                  detailError.message
                );
              }

              const activity = new Activity({
                userId: req.user._id,
                type: "commit",
                data: {
                  commitHash: commit.sha,
                  message: commit.message,
                  repository: event.repo.name,
                  additions: commitDetails?.stats?.additions || 0,
                  deletions: commitDetails?.stats?.deletions || 0,
                  language: "Unknown", // Will be enhanced in method 2
                },
                date: new Date(event.created_at),
              });

              await activity.save();
              totalNewCommits++;
              totalExperience += activity.experience;
              syncResults.fromEvents++;

              // Update pet
              const pet = await Pet.findOne({ userId: req.user._id });
              if (pet) {
                await pet.addExperience(activity.experience);
                pet.stats.totalCommits += 1;
                await pet.save();
              }

              activity.processed = true;
              await activity.save();
            }
          }
        }
      }
    } catch (eventsError) {
      syncResults.errors.push(`Events API error: ${eventsError.message}`);
    }

    // Method 2: Get commits from user's repositories (more detailed, covers older commits)
    try {
      const reposResponse = await axios.get(
        "https://api.github.com/user/repos",
        {
          headers: { Authorization: `token ${req.user.accessToken}` },
          params: {
            sort: "updated",
            per_page: 20, // Limit to avoid rate limits
          },
        }
      );

      const lastSync =
        req.user.lastCommitDate ||
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

      for (const repo of reposResponse.data) {
        try {
          const commitsResponse = await axios.get(
            `https://api.github.com/repos/${repo.full_name}/commits`,
            {
              headers: { Authorization: `token ${req.user.accessToken}` },
              params: {
                author: req.user.username,
                since: lastSync.toISOString(),
                per_page: 50,
              },
            }
          );

          for (const commit of commitsResponse.data) {
            // Check if we already have this commit
            const existingActivity = await Activity.findOne({
              userId: req.user._id,
              type: "commit",
              "data.commitHash": commit.sha,
            });

            if (!existingActivity) {
              // Get detailed commit info
              let commitDetails = null;
              try {
                const detailResponse = await axios.get(commit.url, {
                  headers: { Authorization: `token ${req.user.accessToken}` },
                });
                commitDetails = detailResponse.data;
              } catch (detailError) {
                console.warn(
                  `Could not get commit details for ${commit.sha}:`,
                  detailError.message
                );
              }

              const activity = new Activity({
                userId: req.user._id,
                type: "commit",
                data: {
                  commitHash: commit.sha,
                  message: commit.commit.message,
                  repository: repo.full_name,
                  additions: commitDetails?.stats?.additions || 0,
                  deletions: commitDetails?.stats?.deletions || 0,
                  language: repo.language || "Unknown",
                },
                date: new Date(commit.commit.author.date),
              });

              await activity.save();
              totalNewCommits++;
              totalExperience += activity.experience;
              syncResults.fromRepos++;

              // Update pet
              const pet = await Pet.findOne({ userId: req.user._id });
              if (pet) {
                await pet.addExperience(activity.experience);
                pet.stats.totalCommits += 1;

                // Update language stats
                if (repo.language) {
                  const langIndex = pet.stats.languagesUsed.findIndex(
                    (l) => l.name === repo.language
                  );
                  if (langIndex >= 0) {
                    pet.stats.languagesUsed[langIndex].count += 1;
                  } else {
                    pet.stats.languagesUsed.push({
                      name: repo.language,
                      count: 1,
                    });
                  }
                }

                await pet.save();
              }

              activity.processed = true;
              await activity.save();
            }
          }
        } catch (repoError) {
          syncResults.errors.push(
            `Repo ${repo.full_name} error: ${repoError.message}`
          );
        }
      }
    } catch (reposError) {
      syncResults.errors.push(`Repositories API error: ${reposError.message}`);
    }

    // Update user stats
    req.user.totalCommits = (req.user.totalCommits || 0) + totalNewCommits;
    req.user.lastCommitDate = new Date();
    await req.user.save();

    res.json({
      message: `Successfully synced ${totalNewCommits} new commits`,
      newCommits: totalNewCommits,
      totalExperience: totalExperience,
      syncResults,
      details: {
        fromEvents: syncResults.fromEvents,
        fromRepos: syncResults.fromRepos,
        errors: syncResults.errors,
      },
    });
  } catch (error) {
    console.error("GitHub sync error:", error);
    res.status(500).json({
      message: "Failed to sync GitHub commits",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Get GitHub statistics
router.get("/github-stats", authenticateToken, async (req, res) => {
  try {
    if (!req.user.accessToken) {
      return res.status(400).json({ message: "GitHub access token not found" });
    }

    // Get user's GitHub profile stats
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${req.user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    // Get user's repositories
    const reposResponse = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${req.user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        sort: "updated",
        per_page: 10,
      },
    });

    const stats = {
      githubProfile: {
        publicRepos: userResponse.data.public_repos,
        followers: userResponse.data.followers,
        following: userResponse.data.following,
        createdAt: userResponse.data.created_at,
      },
      recentRepositories: reposResponse.data.map((repo) => ({
        name: repo.name,
        fullName: repo.full_name,
        language: repo.language,
        stars: repo.stargazers_count,
        updatedAt: repo.updated_at,
        url: repo.html_url,
      })),
    };

    res.json(stats);
  } catch (error) {
    console.error("GitHub stats error:", error);
    res.status(500).json({
      message: "Failed to get GitHub stats",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Get user's repositories
router.get("/repositories", authenticateToken, async (req, res) => {
  try {
    if (!req.user.accessToken) {
      return res.status(400).json({ message: "GitHub access token not found" });
    }

    const reposResponse = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${req.user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        sort: "updated",
        per_page: 50,
      },
    });

    const repositories = reposResponse.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      url: repo.html_url,
      private: repo.private,
    }));

    res.json({ repositories });
  } catch (error) {
    console.error("Repositories fetch error:", error);
    res.status(500).json({
      message: "Failed to get repositories",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Automatic GitHub sync (can be called periodically)
router.post("/auto-sync-github", authenticateToken, async (req, res) => {
  try {
    if (!req.user.accessToken) {
      return res.status(400).json({ message: "GitHub access token not found" });
    }

    // Only sync if last sync was more than 1 hour ago to avoid rate limits
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (req.user.lastCommitDate && req.user.lastCommitDate > oneHourAgo) {
      return res.json({
        message: "Sync skipped - too recent",
        lastSync: req.user.lastCommitDate,
        nextSyncAvailable: new Date(
          req.user.lastCommitDate.getTime() + 60 * 60 * 1000
        ),
      });
    }

    // Use the same sync logic but with lighter API calls
    let totalNewCommits = 0;
    let totalExperience = 0;

    // Only get recent events for auto-sync (faster)
    const eventsResponse = await axios.get(
      "https://api.github.com/user/events",
      {
        headers: {
          Authorization: `token ${req.user.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        params: {
          per_page: 50, // Reduced for auto-sync
        },
      }
    );

    const events = eventsResponse.data;

    for (const event of events) {
      if (event.type === "PushEvent" && event.payload.commits) {
        for (const commit of event.payload.commits) {
          const existingActivity = await Activity.findOne({
            userId: req.user._id,
            type: "commit",
            "data.commitHash": commit.sha,
          });

          if (!existingActivity) {
            const activity = new Activity({
              userId: req.user._id,
              type: "commit",
              data: {
                commitHash: commit.sha,
                message: commit.message,
                repository: event.repo.name,
                additions: 0, // Skip detailed stats for auto-sync
                deletions: 0,
                language: "Unknown",
              },
              date: new Date(event.created_at),
            });

            await activity.save();
            totalNewCommits++;
            totalExperience += activity.experience;

            // Update pet
            const pet = await Pet.findOne({ userId: req.user._id });
            if (pet) {
              await pet.addExperience(activity.experience);
              pet.stats.totalCommits += 1;
              await pet.save();
            }

            activity.processed = true;
            await activity.save();
          }
        }
      }
    }

    // Update user stats
    req.user.totalCommits = (req.user.totalCommits || 0) + totalNewCommits;
    req.user.lastCommitDate = new Date();
    await req.user.save();

    res.json({
      message: `Auto-synced ${totalNewCommits} new commits`,
      newCommits: totalNewCommits,
      totalExperience: totalExperience,
      syncType: "automatic",
    });
  } catch (error) {
    console.error("Auto GitHub sync error:", error);
    res.status(500).json({
      message: "Auto-sync failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Get coding streaks and achievements
router.get("/streaks", authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get activities for the last 30 days
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activities = await Activity.find({
      userId: req.user._id,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: 1 });

    // Group activities by day
    const dailyActivity = {};
    activities.forEach((activity) => {
      const day = activity.date.toISOString().split("T")[0];
      if (!dailyActivity[day]) {
        dailyActivity[day] = {
          commits: 0,
          codingTime: 0,
          totalActivity: 0,
        };
      }

      if (activity.type === "commit") {
        dailyActivity[day].commits++;
      } else if (activity.type === "coding_session") {
        dailyActivity[day].codingTime += activity.data.duration || 0;
      }

      dailyActivity[day].totalActivity++;
    });

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check from today backwards
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayKey = checkDate.toISOString().split("T")[0];

      if (dailyActivity[dayKey] && dailyActivity[dayKey].totalActivity > 0) {
        tempStreak++;
        if (i === 0 || currentStreak === i) {
          // Continuous from today
          currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Calculate weekly totals
    const weeklyStats = {
      thisWeek: { commits: 0, codingTime: 0 },
      lastWeek: { commits: 0, codingTime: 0 },
    };

    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    Object.keys(dailyActivity).forEach((day) => {
      const dayDate = new Date(day);
      const stats = dailyActivity[day];

      if (dayDate >= oneWeekAgo) {
        weeklyStats.thisWeek.commits += stats.commits;
        weeklyStats.thisWeek.codingTime += stats.codingTime;
      } else if (dayDate >= twoWeeksAgo) {
        weeklyStats.lastWeek.commits += stats.commits;
        weeklyStats.lastWeek.codingTime += stats.codingTime;
      }
    });

    // Calculate achievements
    const achievements = [];

    if (currentStreak >= 7) {
      achievements.push({
        id: "week_warrior",
        title: "Week Warrior",
        description: "Coded for 7 days in a row",
        icon: "🔥",
        unlockedAt: new Date(),
      });
    }

    if (currentStreak >= 30) {
      achievements.push({
        id: "month_master",
        title: "Month Master",
        description: "Coded for 30 days in a row",
        icon: "👑",
        unlockedAt: new Date(),
      });
    }

    if (weeklyStats.thisWeek.commits >= 10) {
      achievements.push({
        id: "commit_crusher",
        title: "Commit Crusher",
        description: "Made 10+ commits this week",
        icon: "💪",
        unlockedAt: new Date(),
      });
    }

    if (weeklyStats.thisWeek.codingTime >= 300) {
      // 5 hours
      achievements.push({
        id: "time_titan",
        title: "Time Titan",
        description: "Coded for 5+ hours this week",
        icon: "⏰",
        unlockedAt: new Date(),
      });
    }

    res.json({
      currentStreak,
      longestStreak,
      weeklyStats,
      achievements,
      dailyActivity: Object.keys(dailyActivity)
        .slice(-7)
        .reduce((acc, day) => {
          acc[day] = dailyActivity[day];
          return acc;
        }, {}),
    });
  } catch (error) {
    console.error("Streaks calculation error:", error);
    res.status(500).json({
      message: "Failed to calculate streaks",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Real-time GitHub sync with better error handling
router.post("/sync-github-realtime", authenticateToken, async (req, res) => {
  try {
    if (!req.user.accessToken) {
      return res.status(400).json({ message: "GitHub access token not found" });
    }

    const { forceSync = false } = req.body;

    // Rate limiting check (unless forced)
    if (!forceSync) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (req.user.lastCommitDate && req.user.lastCommitDate > fiveMinutesAgo) {
        return res.json({
          message: "Rate limited - sync too recent",
          lastSync: req.user.lastCommitDate,
          nextSyncAvailable: new Date(
            req.user.lastCommitDate.getTime() + 5 * 60 * 1000
          ),
          newCommits: 0,
          totalExperience: 0,
        });
      }
    }

    let totalNewCommits = 0;
    let totalExperience = 0;
    const syncLog = [];

    // Get recent events with enhanced error handling
    try {
      syncLog.push("🔍 Fetching recent GitHub events...");

      const eventsResponse = await axios.get(
        "https://api.github.com/user/events",
        {
          headers: {
            Authorization: `token ${req.user.accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "CodePets-App",
          },
          params: {
            per_page: 100,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      syncLog.push(`📋 Found ${eventsResponse.data.length} recent events`);

      const pushEvents = eventsResponse.data.filter(
        (e) => e.type === "PushEvent"
      );
      syncLog.push(`🚀 Found ${pushEvents.length} push events`);

      for (const event of pushEvents) {
        if (event.payload && event.payload.commits) {
          for (const commit of event.payload.commits) {
            // Skip merge commits
            if (commit.message.toLowerCase().includes("merge")) {
              continue;
            }

            const existingActivity = await Activity.findOne({
              userId: req.user._id,
              type: "commit",
              "data.commitHash": commit.sha,
            });

            if (!existingActivity) {
              // Get detailed commit info for better stats
              let commitStats = { additions: 0, deletions: 0 };
              try {
                if (commit.url) {
                  const detailResponse = await axios.get(commit.url, {
                    headers: {
                      Authorization: `token ${req.user.accessToken}`,
                      "User-Agent": "CodePets-App",
                    },
                    timeout: 5000,
                  });
                  commitStats = {
                    additions: detailResponse.data.stats?.additions || 0,
                    deletions: detailResponse.data.stats?.deletions || 0,
                  };
                }
              } catch (detailError) {
                syncLog.push(
                  `⚠️ Could not get details for commit ${commit.sha.substring(
                    0,
                    7
                  )}`
                );
              }

              const activity = new Activity({
                userId: req.user._id,
                type: "commit",
                data: {
                  commitHash: commit.sha,
                  message: commit.message.substring(0, 200), // Truncate long messages
                  repository: event.repo.name,
                  additions: commitStats.additions,
                  deletions: commitStats.deletions,
                  language: "Unknown",
                },
                date: new Date(event.created_at),
              });

              await activity.save();
              totalNewCommits++;
              totalExperience += activity.experience;

              syncLog.push(
                `✅ Added commit: ${commit.message.substring(0, 50)}... (+${
                  activity.experience
                } XP)`
              );

              // Update pet
              const pet = await Pet.findOne({ userId: req.user._id });
              if (pet) {
                await pet.addExperience(activity.experience);
                pet.stats.totalCommits += 1;
                await pet.save();
              }

              activity.processed = true;
              await activity.save();
            }
          }
        }
      }
    } catch (eventsError) {
      syncLog.push(`❌ Events API error: ${eventsError.message}`);

      // If events fail, try fallback approach
      if (eventsError.response?.status === 403) {
        syncLog.push("🚫 Rate limited by GitHub - trying fallback approach");

        // Try getting from user's most recently updated repos
        try {
          const reposResponse = await axios.get(
            "https://api.github.com/user/repos",
            {
              headers: {
                Authorization: `token ${req.user.accessToken}`,
                "User-Agent": "CodePets-App",
              },
              params: {
                sort: "updated",
                per_page: 5,
              },
              timeout: 10000,
            }
          );

          for (const repo of reposResponse.data) {
            try {
              const commitsResponse = await axios.get(
                `https://api.github.com/repos/${repo.full_name}/commits`,
                {
                  headers: {
                    Authorization: `token ${req.user.accessToken}`,
                    "User-Agent": "CodePets-App",
                  },
                  params: {
                    author: req.user.username,
                    per_page: 10,
                  },
                }
              );

              for (const commit of commitsResponse.data.slice(0, 3)) {
                // Limit to 3 per repo
                const existingActivity = await Activity.findOne({
                  userId: req.user._id,
                  type: "commit",
                  "data.commitHash": commit.sha,
                });

                if (!existingActivity) {
                  const activity = new Activity({
                    userId: req.user._id,
                    type: "commit",
                    data: {
                      commitHash: commit.sha,
                      message: commit.commit.message.substring(0, 200),
                      repository: repo.full_name,
                      additions: 0,
                      deletions: 0,
                      language: repo.language || "Unknown",
                    },
                    date: new Date(commit.commit.author.date),
                  });

                  await activity.save();
                  totalNewCommits++;
                  totalExperience += activity.experience;

                  syncLog.push(
                    `✅ Fallback: Added commit from ${repo.name} (+${activity.experience} XP)`
                  );

                  const pet = await Pet.findOne({ userId: req.user._id });
                  if (pet) {
                    await pet.addExperience(activity.experience);
                    pet.stats.totalCommits += 1;
                    await pet.save();
                  }

                  activity.processed = true;
                  await activity.save();
                }
              }
            } catch (repoError) {
              syncLog.push(`⚠️ Repo ${repo.name} error: ${repoError.message}`);
            }
          }
        } catch (fallbackError) {
          syncLog.push(`❌ Fallback failed: ${fallbackError.message}`);
        }
      }
    }

    // Update user stats
    req.user.totalCommits = (req.user.totalCommits || 0) + totalNewCommits;
    req.user.lastCommitDate = new Date();
    await req.user.save();

    syncLog.push(
      `🎉 Sync complete: ${totalNewCommits} new commits, ${totalExperience} XP gained`
    );

    res.json({
      message: `Successfully synced ${totalNewCommits} new commits`,
      newCommits: totalNewCommits,
      totalExperience: totalExperience,
      syncLog,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Real-time GitHub sync error:", error);
    res.status(500).json({
      message: "Failed to sync GitHub commits",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
      syncLog: [`❌ Fatal error: ${error.message}`],
    });
  }
});

module.exports = router;
