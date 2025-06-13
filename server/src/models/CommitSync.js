import mongoose from "mongoose";

const commitSyncSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    newCommits: {
      type: Number,
      required: true,
      default: 0,
    },
    pointsEarned: {
      type: Number,
      required: true,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    }
  },
  {
    timestamps: true,
  }
);

const CommitSync = mongoose.model("CommitSync", commitSyncSchema);

export default CommitSync;
