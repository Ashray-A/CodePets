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
  },  stage: {
    type: String,
    enum: ['egg', 'hatching', 'baby', 'juvenile', 'teen', 'young_adult', 'adult', 'elder', 'legendary'],
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
  hatching: 50,
  baby: 150,
  juvenile: 350,
  teen: 650,
  young_adult: 1100,
  adult: 1800,
  elder: 2800,
  legendary: 4500
};

// Calculate pet stage based on experience
petSchema.methods.calculateStage = function() {
  const thresholds = this.constructor.STAGE_THRESHOLDS;
  
  if (this.experience >= thresholds.legendary) return 'legendary';
  if (this.experience >= thresholds.elder) return 'elder';
  if (this.experience >= thresholds.adult) return 'adult';
  if (this.experience >= thresholds.young_adult) return 'young_adult';
  if (this.experience >= thresholds.teen) return 'teen';
  if (this.experience >= thresholds.juvenile) return 'juvenile';
  if (this.experience >= thresholds.baby) return 'baby';
  if (this.experience >= thresholds.hatching) return 'hatching';
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
