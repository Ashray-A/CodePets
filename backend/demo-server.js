// Development script to test API endpoints without MongoDB
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5001; // Different port to avoid conflict

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Mock data
const mockUser = {
  id: "demo-user-id",
  username: "demo-user",
  email: "demo@example.com",
  avatarUrl: "https://github.com/github.png",
  githubUrl: "https://github.com/demo-user",
  joinedAt: new Date().toISOString(),
  totalCommits: 45,
  currentStreak: 8,
  longestStreak: 21,
};

const mockPet = {
  id: "demo-pet-id",
  name: "Demo Pet",
  stage: "adult",
  experience: 2500,
  level: 5,
  birthDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  evolutionHistory: [
    {
      stage: "egg",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      experience: 0,
    },
    {
      stage: "baby",
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      experience: 100,
    },
    {
      stage: "teen",
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      experience: 500,
    },
    {
      stage: "junior",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      experience: 1200,
    },
    {
      stage: "adult",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      experience: 2500,
    },
  ],
  stats: {
    totalCodingTime: 1200, // 20 hours
    totalCommits: 45,
    longestStreak: 21,
    languagesUsed: [
      { name: "JavaScript", count: 18 },
      { name: "Python", count: 12 },
      { name: "TypeScript", count: 10 },
      { name: "React", count: 8 },
      { name: "CSS", count: 5 },
    ],
  },
  nextThreshold: 5000,
  stageThresholds: {
    egg: 0,
    baby: 100,
    teen: 500,
    junior: 1200,
    adult: 2500,
    senior: 5000,
    veteran: 10000,
    master: 20000,
    legendary: 50000,
  },
};

const mockActivities = [
  {
    id: "1",
    type: "commit",
    data: {
      repository: "demo-user/awesome-project",
      message: "Add new feature",
      additions: 25,
      deletions: 5,
    },
    experience: 15,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    type: "coding_session",
    data: {
      duration: 120,
      language: "JavaScript",
      project: "CodePets",
      description: "Working on pet evolution system",
    },
    experience: 120,
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    message: "CodePets Demo API is running!",
    timestamp: new Date().toISOString(),
    environment: "development-demo",
  });
});

// Simple token validation (just check if token exists)
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  req.user = mockUser;
  next();
};

// Auth routes
app.post("/api/auth/github", (req, res) => {
  const token = "demo_jwt_token_" + Date.now();
  res.json({
    token,
    user: mockUser,
  });
});

app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ user: mockUser });
});

// Pet routes
app.get("/api/pets", authenticateToken, (req, res) => {
  res.json(mockPet);
});

app.put("/api/pets/name", authenticateToken, (req, res) => {
  const { name } = req.body;
  mockPet.name = name;
  res.json({ message: "Pet name updated successfully", name: mockPet.name });
});

// Activity routes
app.get("/api/activities", authenticateToken, (req, res) => {
  res.json({
    activities: mockActivities,
    pagination: {
      page: 1,
      limit: 20,
      total: mockActivities.length,
      pages: 1,
    },
  });
});

app.post("/api/activities/manual-log", authenticateToken, (req, res) => {
  const { duration, language, project, description } = req.body;

  const newActivity = {
    id: Date.now().toString(),
    type: "coding_session",
    data: {
      duration: parseInt(duration),
      language: language || "Unknown",
      project: project || "Personal Project",
      description: description || "Manual coding session",
    },
    experience: parseInt(duration),
    date: new Date().toISOString(),
  };
  mockActivities.unshift(newActivity);
  mockPet.experience += newActivity.experience;
  mockPet.stats.totalCodingTime += newActivity.data.duration;

  // 9-stage evolution system
  const evolutionStages = [
    { stage: "egg", threshold: 0 },
    { stage: "baby", threshold: 100 },
    { stage: "teen", threshold: 500 },
    { stage: "junior", threshold: 1000 },
    { stage: "adult", threshold: 2000 },
    { stage: "senior", threshold: 3500 },
    { stage: "veteran", threshold: 5500 },
    { stage: "master", threshold: 8000 },
    { stage: "legendary", threshold: 12000 },
  ];

  // Find the appropriate stage for current experience
  let newStage = mockPet.stage;
  for (let i = evolutionStages.length - 1; i >= 0; i--) {
    if (mockPet.experience >= evolutionStages[i].threshold) {
      newStage = evolutionStages[i].stage;
      break;
    }
  }

  // Check if pet evolved
  if (newStage !== mockPet.stage) {
    mockPet.stage = newStage;
    mockPet.evolutionHistory.push({
      stage: newStage,
      date: new Date().toISOString(),
      experience: mockPet.experience,
    });
  }

  res.json({
    message: "Coding session logged successfully!",
    activity: newActivity,
    experienceGained: newActivity.experience,
  });
});

// User routes
app.get("/api/users/stats", authenticateToken, (req, res) => {
  res.json({
    totalCommits: mockUser.totalCommits,
    currentStreak: mockUser.currentStreak,
    longestStreak: mockUser.longestStreak,
    lastCommitDate: new Date(
      Date.now() - 1 * 24 * 60 * 60 * 1000
    ).toISOString(),
    weeklyCommits: 5,
    weeklyCodingTime: 180,
    recentActivities: mockActivities.slice(0, 5),
  });
});

app.listen(PORT, () => {
  console.log(`Demo API server is running on port ${PORT}`);
  console.log(`Switch your frontend to use: http://localhost:${PORT}/api`);
});

module.exports = app;
