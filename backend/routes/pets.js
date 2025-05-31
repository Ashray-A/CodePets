const express = require("express");
const jwt = require("jsonwebtoken");
const Pet = require("../models/Pet");
const User = require("../models/User");

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get user's pet
router.get("/", authenticateToken, async (req, res) => {
  try {
    let pet = await Pet.findOne({ userId: req.user._id });

    // Create pet if it doesn't exist
    if (!pet) {
      pet = new Pet({
        userId: req.user._id,
        name: `${req.user.username}'s Pet`,
      });
      await pet.save();
    }
    // Calculate next stage threshold
    const thresholds = Pet.STAGE_THRESHOLDS;
    const currentStage = pet.stage;
    let nextThreshold = null;

    const stages = [
      "egg",
      "hatching",
      "baby",
      "juvenile",
      "teen",
      "young_adult",
      "adult",
      "elder",
      "legendary",
    ];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      nextThreshold = thresholds[nextStage];
    }
    res.json({
      id: pet._id,
      name: pet.name,
      stage: pet.stage,
      experience: pet.experience,
      level: pet.level,
      birthDate: pet.birthDate,
      evolutionHistory: pet.evolutionHistory,
      stats: pet.stats,
      nextThreshold,
      stageThresholds: thresholds,
    });
  } catch (error) {
    console.error("Get pet error:", error);
    res.status(500).json({ message: "Failed to get pet data" });
  }
});

// Update pet name
router.put("/name", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Pet name is required" });
    }

    if (name.length > 50) {
      return res
        .status(400)
        .json({ message: "Pet name must be 50 characters or less" });
    }

    const pet = await Pet.findOne({ userId: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    pet.name = name.trim();
    await pet.save();

    res.json({ message: "Pet name updated successfully", name: pet.name });
  } catch (error) {
    res.status(500).json({ message: "Failed to update pet name" });
  }
});

// Get pet evolution history
router.get("/evolution", authenticateToken, async (req, res) => {
  try {
    const pet = await Pet.findOne({ userId: req.user._id });
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json({
      currentStage: pet.stage,
      experience: pet.experience,
      evolutionHistory: pet.evolutionHistory,
      stageThresholds: Pet.STAGE_THRESHOLDS,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get evolution history" });
  }
});

module.exports = router;
