import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const validatePoints = (commits, hours) => {
  const commitPoints = Math.max(0, commits * 0.5);
  const timePoints = Math.max(0, hours * 1);
  return {
    commitPoints,
    timePoints,
    totalPoints: commitPoints + timePoints,
  };
};

export const formatError = (error) => {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);
    return {
      type: "validation",
      message: messages.join(", "),
    };
  }

  if (error.code === 11000) {
    return {
      type: "duplicate",
      message: "Resource already exists",
    };
  }

  return {
    type: "general",
    message: error.message || "An error occurred",
  };
};
