// Development script to test API endpoints without MongoDB
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001; // Different port to avoid conflict

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Mock data
const mockUser = {
  id: 'demo-user-id',
  username: 'demo-user',
  email: 'demo@example.com',
  avatarUrl: 'https://github.com/github.png',
  githubUrl: 'https://github.com/demo-user',
  joinedAt: new Date().toISOString(),
  totalCommits: 15,
  currentStreak: 3,
  longestStreak: 7
};

const mockPet = {
  id: 'demo-pet-id',
  name: 'Demo Pet',
  stage: 'teen',
  experience: 750,
  level: 3,
  happiness: 85,
  health: 95,
  lastFed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  lastPlayed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  birthDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
  evolutionHistory: [
    { stage: 'egg', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), experience: 0 },
    { stage: 'baby', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), experience: 100 },
    { stage: 'teen', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), experience: 500 }
  ],
  stats: {
    totalCodingTime: 420, // 7 hours
    totalCommits: 15,
    longestStreak: 7,
    languagesUsed: [
      { name: 'JavaScript', count: 8 },
      { name: 'Python', count: 4 },
      { name: 'TypeScript', count: 3 }
    ]
  },
  nextThreshold: 1500,
  stageThresholds: {
    egg: 0,
    baby: 100,
    teen: 500,
    adult: 1500,
    master: 3000
  }
};

const mockActivities = [
  {
    id: '1',
    type: 'commit',
    data: {
      repository: 'demo-user/awesome-project',
      message: 'Add new feature',
      additions: 25,
      deletions: 5
    },
    experience: 15,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'coding_session',
    data: {
      duration: 120,
      language: 'JavaScript',
      project: 'CodePets',
      description: 'Working on pet evolution system'
    },
    experience: 120,
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'CodePets Demo API is running!', 
    timestamp: new Date().toISOString(),
    environment: 'development-demo'
  });
});

// Simple token validation (just check if token exists)
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  req.user = mockUser;
  next();
};

// Auth routes
app.post('/api/auth/github', (req, res) => {
  const token = 'demo_jwt_token_' + Date.now();
  res.json({
    token,
    user: mockUser
  });
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ user: mockUser });
});

// Pet routes
app.get('/api/pets', authenticateToken, (req, res) => {
  res.json(mockPet);
});

app.put('/api/pets/name', authenticateToken, (req, res) => {
  const { name } = req.body;
  mockPet.name = name;
  res.json({ message: 'Pet name updated successfully', name: mockPet.name });
});

app.post('/api/pets/feed', authenticateToken, (req, res) => {
  mockPet.lastFed = new Date().toISOString();
  mockPet.happiness = Math.min(100, mockPet.happiness + 10);
  res.json({
    message: 'Pet fed successfully!',
    happiness: mockPet.happiness,
    lastFed: mockPet.lastFed
  });
});

app.post('/api/pets/play', authenticateToken, (req, res) => {
  mockPet.lastPlayed = new Date().toISOString();
  mockPet.happiness = Math.min(100, mockPet.happiness + 15);
  res.json({
    message: 'Pet played successfully!',
    happiness: mockPet.happiness,
    lastPlayed: mockPet.lastPlayed
  });
});

// Activity routes
app.get('/api/activities', authenticateToken, (req, res) => {
  res.json({
    activities: mockActivities,
    pagination: {
      page: 1,
      limit: 20,
      total: mockActivities.length,
      pages: 1
    }
  });
});

app.post('/api/activities/manual-log', authenticateToken, (req, res) => {
  const { duration, language, project, description } = req.body;
  
  const newActivity = {
    id: Date.now().toString(),
    type: 'coding_session',
    data: {
      duration: parseInt(duration),
      language: language || 'Unknown',
      project: project || 'Personal Project',
      description: description || 'Manual coding session'
    },
    experience: parseInt(duration),
    date: new Date().toISOString()
  };
  
  mockActivities.unshift(newActivity);
  mockPet.experience += newActivity.experience;
  mockPet.stats.totalCodingTime += newActivity.data.duration;
  
  // Update pet stage if needed
  if (mockPet.experience >= 1500 && mockPet.stage === 'teen') {
    mockPet.stage = 'adult';
    mockPet.evolutionHistory.push({
      stage: 'adult',
      date: new Date().toISOString(),
      experience: mockPet.experience
    });
  } else if (mockPet.experience >= 3000 && mockPet.stage === 'adult') {
    mockPet.stage = 'master';
    mockPet.evolutionHistory.push({
      stage: 'master',
      date: new Date().toISOString(),
      experience: mockPet.experience
    });
  }
  
  res.json({
    message: 'Coding session logged successfully!',
    activity: newActivity,
    experienceGained: newActivity.experience
  });
});

// User routes
app.get('/api/users/stats', authenticateToken, (req, res) => {
  res.json({
    totalCommits: mockUser.totalCommits,
    currentStreak: mockUser.currentStreak,
    longestStreak: mockUser.longestStreak,
    lastCommitDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    weeklyCommits: 5,
    weeklyCodingTime: 180,
    recentActivities: mockActivities.slice(0, 5)
  });
});

app.listen(PORT, () => {
  console.log(`Demo API server is running on port ${PORT}`);
  console.log(`Switch your frontend to use: http://localhost:${PORT}/api`);
});

module.exports = app;
