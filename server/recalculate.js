import mongoose from "mongoose";
import Pet from "./src/models/Pet.js";
import CommitSync from "./src/models/CommitSync.js";
import TimeLog from "./src/models/TimeLog.js";
import dotenv from "dotenv";

dotenv.config();

async function recalculatePetPoints() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/codepets"
    );
    console.log("Connected to MongoDB");

    const pets = await Pet.find({});
    console.log(`Found ${pets.length} pets to recalculate`);

    for (const pet of pets) {
      console.log(`\nRecalculating points for pet: ${pet.name}`);
      console.log(
        `Current points - Commit: ${pet.commitPoints}, Time: ${pet.timePoints}, Total: ${pet.totalPoints}`
      );

      // Calculate correct commit points from CommitSync records
      const commitSyncs = await CommitSync.find({ userId: pet.userId });
      const correctCommitPoints = commitSyncs.reduce(
        (sum, sync) => sum + sync.pointsEarned,
        0
      );
      const correctTotalCommits = commitSyncs.reduce(
        (sum, sync) => sum + sync.newCommits,
        0
      );

      // Calculate correct time points from TimeLog records
      const timeLogs = await TimeLog.find({ userId: pet.userId });
      const correctTimePoints = timeLogs.reduce(
        (sum, log) => sum + log.points,
        0
      );
      const correctTotalHours = timeLogs.reduce(
        (sum, log) => sum + log.hours,
        0
      );

      // Update pet with correct values
      pet.commitPoints = correctCommitPoints;
      pet.timePoints = correctTimePoints;
      pet.totalCommits = correctTotalCommits;
      pet.totalHours = correctTotalHours;
      pet.updatePoints(); // This recalculates totalPoints and level

      await pet.save();

      console.log(
        `Updated points - Commit: ${pet.commitPoints}, Time: ${pet.timePoints}, Total: ${pet.totalPoints}, Level: ${pet.level}`
      );
    }

    await mongoose.disconnect();
    console.log("\nPet points recalculation complete");
  } catch (error) {
    console.error("Recalculation error:", error);
    process.exit(1);
  }
}

recalculatePetPoints();
