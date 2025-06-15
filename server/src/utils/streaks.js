import User from "../models/User.js";
import CommitSync from "../models/CommitSync.js";
import TimeLog from "../models/TimeLog.js";

/**
 * Calculate and update streaks for a user based on their coding activity
 * @param {string} userId - User ID
 * @param {Date} activityDate - Date of the activity (optional, defaults to today)
 */
export const updateUserStreak = async (userId, activityDate = new Date()) => {
  try {
    console.log(`🔥 Updating streak for user ${userId} on ${activityDate}`);

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    console.log(`🔥 Current user streak data:`, {
      username: user.username,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActivityDate: user.lastActivityDate,
    });

    // Normalize the activity date to start of day
    const today = new Date(activityDate);
    today.setHours(0, 0, 0, 0);

    const lastActivityDate = user.lastActivityDate
      ? new Date(user.lastActivityDate)
      : null;

    if (lastActivityDate) {
      lastActivityDate.setHours(0, 0, 0, 0);
    }

    console.log(`🔥 Date comparison:`, {
      today: today.toDateString(),
      lastActivity: lastActivityDate?.toDateString() || "Never",
    });

    // If this is the first activity, start streak at 1
    if (!lastActivityDate) {
      user.currentStreak = 1;
      user.longestStreak = Math.max(user.longestStreak, 1);
      user.lastActivityDate = activityDate;
      await user.save();
      console.log(
        `🔥 First activity for ${user.username}: streak started at 1`
      );
      return user;
    }

    // If same day, don't change streak but update last activity time
    if (today.getTime() === lastActivityDate.getTime()) {
      user.lastActivityDate = activityDate;
      await user.save();
      console.log(
        `🔥 Same day activity for ${user.username}: streak unchanged at ${user.currentStreak}`
      );
      return user;
    }

    // Calculate days between last activity and today
    const daysDiff = Math.floor(
      (today - lastActivityDate) / (1000 * 60 * 60 * 24)
    );
    console.log(`🔥 Days difference: ${daysDiff}`);

    if (daysDiff === 1) {
      // Consecutive day - increment streak
      user.currentStreak += 1;
      user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
      console.log(`🔥 Consecutive day! New streak: ${user.currentStreak}`);
    } else if (daysDiff > 1) {
      // Gap in activity - reset current streak to 1
      user.currentStreak = 1;
      console.log(`🔥 Gap of ${daysDiff} days, resetting streak to 1`);
    }

    user.lastActivityDate = activityDate;
    await user.save();

    console.log(
      `🔥 Streak updated for ${user.username}: current=${user.currentStreak}, longest=${user.longestStreak}`
    );

    return user;
  } catch (error) {
    console.error("Error updating user streak:", error);
    throw error;
  }
};

/**
 * Get streak information for a user
 * @param {string} userId - User ID
 */
export const getUserStreak = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      "currentStreak longestStreak lastActivityDate username"
    );
    if (!user) {
      throw new Error("User not found");
    }

    // Check if streak should be reset due to inactivity
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (user.lastActivityDate) {
      const lastActivity = new Date(user.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);

      const daysSinceLastActivity = Math.floor(
        (now - lastActivity) / (1000 * 60 * 60 * 24)
      );

      // If more than 1 day since last activity, reset current streak
      if (daysSinceLastActivity > 1 && user.currentStreak > 0) {
        user.currentStreak = 0;
        await user.save();
        console.log(
          `🔥 Streak reset for ${user.username} due to ${daysSinceLastActivity} days of inactivity`
        );
      }
    }

    return {
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActivityDate: user.lastActivityDate,
    };
  } catch (error) {
    console.error("Error getting user streak:", error);
    throw error;
  }
};

/**
 * Get leaderboard of users by current streak
 * @param {number} limit - Number of users to return (default 50)
 */
export const getStreakLeaderboard = async (limit = 50) => {
  try {
    const users = await User.find({
      currentStreak: { $gt: 0 },
    })
      .select("username avatarUrl currentStreak longestStreak lastActivityDate")
      .sort({ currentStreak: -1, longestStreak: -1 })
      .limit(limit)
      .lean();

    // Filter out users whose streaks should be reset
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const activeStreaks = users.filter((user) => {
      if (!user.lastActivityDate) return false;

      const lastActivity = new Date(user.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);

      const daysSinceLastActivity = Math.floor(
        (now - lastActivity) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastActivity <= 1; // Include today and yesterday
    });

    return activeStreaks.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      avatarUrl: user.avatarUrl,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActivityDate: user.lastActivityDate,
    }));
  } catch (error) {
    console.error("Error getting streak leaderboard:", error);
    throw error;
  }
};
