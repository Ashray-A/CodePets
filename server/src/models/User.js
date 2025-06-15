import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
    },
    githubProfile: {
      type: String,
    },
    accessToken: {
      type: String,
      required: true,
    },
    lastSynced: {
      type: Date,
      // No default - null for new users who haven't synced yet
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
