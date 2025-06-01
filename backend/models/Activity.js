const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["commit", "coding_session", "manual_log"],
      required: true,
    },
    data: {
      // For commits
      commitHash: String,
      repository: String,
      message: String,
      additions: Number,
      deletions: Number,

      // For coding sessions
      duration: Number, // in minutes
      language: String,
      project: String,

      // For manual logs
      description: String,
      category: String,
    },
    experience: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    processed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate experience based on activity type - Reduced for balance
activitySchema.methods.calculateExperience = function () {
  switch (this.type) {
    case "commit":
      // Reduced base experience + smaller bonus for larger commits
      const lines = (this.data.additions || 0) + (this.data.deletions || 0);
      return Math.min(25, 5 + Math.floor(lines / 20)); // Max 25 XP per commit (was 50)

    case "coding_session":
      // Reduced to 0.5 XP per minute of coding (was 1 XP per minute)
      return Math.floor((this.data.duration || 0) * 0.5);

    case "manual_log":
      // Reduced fixed amount for manual logs
      return 3; // Was 5

    default:
      return 0;
  }
};

// Auto-calculate experience before saving
activitySchema.pre("save", function (next) {
  if (this.isNew) {
    this.experience = this.calculateExperience();
  }
  next();
});

module.exports = mongoose.model("Activity", activitySchema);
