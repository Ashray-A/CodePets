// Quick diagnostic script to check weekly commit calculations
import mongoose from "mongoose";
import CommitSync from "./src/models/CommitSync.js";
import User from "./src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function checkWeeklyCommits() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find a user with recent activity
    const user = await User.findOne({ lastSynced: { $exists: true } }).sort({
      lastSynced: -1,
    });
    if (!user) {
      console.log("❌ No users with sync history found");
      return;
    }

    console.log(`📋 Checking user: ${user.username} (${user.email})`);
    console.log(`📅 Last synced: ${user.lastSynced}`);

    // Get all commit syncs for this user
    const allSyncs = await CommitSync.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    console.log(`📊 Total sync records: ${allSyncs.length}`);

    if (allSyncs.length > 0) {
      console.log(`📈 Recent syncs:`);
      allSyncs.slice(0, 5).forEach((sync, index) => {
        console.log(
          `  ${index + 1}. ${sync.createdAt.toISOString()} - ${
            sync.newCommits
          } commits, ${sync.pointsEarned} points`
        );
      });
    }

    // Calculate weekly commits
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    console.log(`📅 Week ago threshold: ${weekAgo.toISOString()}`);

    const thisWeekSyncs = await CommitSync.find({
      userId: user._id,
      createdAt: { $gte: weekAgo },
    });

    console.log(`📊 This week's syncs: ${thisWeekSyncs.length}`);
    const thisWeekCommits = thisWeekSyncs.reduce(
      (sum, sync) => sum + sync.newCommits,
      0
    );
    console.log(`🎯 This week's total commits: ${thisWeekCommits}`);

    if (thisWeekSyncs.length > 0) {
      console.log(`📈 This week's sync details:`);
      thisWeekSyncs.forEach((sync, index) => {
        console.log(
          `  ${index + 1}. ${sync.createdAt.toISOString()} - ${
            sync.newCommits
          } commits`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📴 Disconnected from MongoDB");
  }
}

checkWeeklyCommits();
