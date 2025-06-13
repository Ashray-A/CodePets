import mongoose from "mongoose";

const timeLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0.1,
      max: 24,
    },
    description: {
      type: String,
      maxLength: 200,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    points: {
      type: Number,
      default: function () {
        return this.hours * 1; // 1 point per hour
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
timeLogSchema.index({ userId: 1, date: -1 });

const TimeLog = mongoose.model("TimeLog", timeLogSchema);

export default TimeLog;
