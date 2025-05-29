const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: 'My Pet'
  },
  stage: {
    type: String,
    enum: ['egg', 'baby', 'teen', 'adult', 'master'],
    default: 'egg'
  },
  experience: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  birthDate: {
    type: Date,
    default: Date.now
  },
  evolutionHistory: [{
    stage: String,
    date: Date,
    experience: Number
  }],
  stats: {
    totalCodingTime: {
      type: Number,
      default: 0 // in minutes
    },
    totalCommits: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    languagesUsed: [{
      name: String,
      count: Number
    }]
  }
}, {
  timestamps: true
});

// Experience thresholds for each stage
petSchema.statics.STAGE_THRESHOLDS = {
  egg: 0,
  baby: 100,
  teen: 500,
  adult: 1500,
  master: 3000
};

// Calculate pet stage based on experience
petSchema.methods.calculateStage = function() {
  const thresholds = this.constructor.STAGE_THRESHOLDS;
  
  if (this.experience >= thresholds.master) return 'master';
  if (this.experience >= thresholds.adult) return 'adult';
  if (this.experience >= thresholds.teen) return 'teen';
  if (this.experience >= thresholds.baby) return 'baby';
  return 'egg';
};

// Add experience and update stage if necessary
petSchema.methods.addExperience = function(amount) {
  const oldStage = this.stage;
  this.experience += amount;
  
  const newStage = this.calculateStage();
  if (newStage !== oldStage) {
    this.evolutionHistory.push({
      stage: newStage,
      date: new Date(),
      experience: this.experience
    });
    this.stage = newStage;
  }
  
  return this.save();
};

module.exports = mongoose.model('Pet', petSchema);
