import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: "Coding Cat",
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    commitPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    timePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCommits: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate level based on total points
petSchema.methods.calculateLevel = function () {
  const points = this.totalPoints;
  if (points >= 501) return 5;
  if (points >= 301) return 4;
  if (points >= 151) return 3;
  if (points >= 51) return 2;
  return 1;
};

// Update points and level
petSchema.methods.updatePoints = function () {
  this.totalPoints = this.commitPoints + this.timePoints;
  this.level = this.calculateLevel();
  this.lastActivity = new Date();
};

// Get progress to next level
petSchema.methods.getProgressToNextLevel = function () {
  const levelThresholds = [0, 51, 151, 301, 501];
  const currentLevel = this.level;

  if (currentLevel >= 5) {
    return {
      current: this.totalPoints,
      needed: 0,
      progress: 100,
      isMaxLevel: true,
    };
  }

  const currentThreshold = levelThresholds[currentLevel - 1];
  const nextThreshold = levelThresholds[currentLevel];
  const progress =
    ((this.totalPoints - currentThreshold) /
      (nextThreshold - currentThreshold)) *
    100;

  return {
    current: this.totalPoints,
    needed: nextThreshold - this.totalPoints,
    progress: Math.max(0, Math.min(100, progress)),
    isMaxLevel: false,
  };
};

const Pet = mongoose.model("Pet", petSchema);

export default Pet;
