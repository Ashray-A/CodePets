import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

// Import routes
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";
import petRoutes from "./src/routes/pets.js";
import githubRoutes from "./src/routes/github.js";
import streaksRoutes from "./src/routes/streaks.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);

// CORS configuration
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        process.env.CLIENT_URL,
        "https://codepets.vercel.app",
        "https://code-pets.vercel.app", // Your actual Vercel domain
        "https://codepets-git-main.vercel.app", // Git branch deployments
        "https://code-pets-git-main.vercel.app", // Git branch deployments
      ].filter(Boolean) // Remove any undefined values
    : [process.env.CLIENT_URL || "http://localhost:5173"];

console.log("🌐 CORS allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/streaks", streaksRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CodePets API is running",
    timestamp: new Date().toISOString(),
  });
});

// CORS debug endpoint
app.get("/api/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working",
    origin: req.headers.origin,
    allowedOrigins:
      process.env.NODE_ENV === "production"
        ? [
            process.env.CLIENT_URL,
            "https://codepets.vercel.app",
            "https://code-pets.vercel.app",
            "https://codepets-git-main.vercel.app",
            "https://code-pets-git-main.vercel.app",
          ].filter(Boolean)
        : [process.env.CLIENT_URL || "http://localhost:5173"],
    environment: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Database connection
const connectDB = async () => {
  try {
    if (
      !process.env.MONGODB_URI ||
      process.env.MONGODB_URI.includes("username:password")
    ) {
      console.log(
        "⚠️  MongoDB URI not configured. Please set up MongoDB Atlas and update MONGODB_URI in .env"
      );
      console.log("📖 See docs for setup instructions");
      return false;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    return false;
  }
};

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 API available at http://localhost:${PORT}/api`);
    if (!dbConnected) {
      console.log("⚠️  Running without database connection");
    }
  });
};

startServer();

export default app;
