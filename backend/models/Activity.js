const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['commit', 'coding_session', 'manual_log'],
    required: true
  },
  data: {
    // For commits
    commitHash: String,
    repository: String,
    message: String,
    additions: Number,
    deletions: Number,
    
    // For coding sessions
    duration: Number, // in minutes
    language: String,
    project: String,
    
    // For manual logs
    description: String,
    category: String
  },
  experience: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate experience based on activity type
activitySchema.methods.calculateExperience = function() {
  switch (this.type) {
    case 'commit':
      // Base experience + bonus for larger commits
      const lines = (this.data.additions || 0) + (this.data.deletions || 0);
      return Math.min(50, 10 + Math.floor(lines / 10)); // Max 50 XP per commit
      
    case 'coding_session':
      // 1 XP per minute of coding
      return this.data.duration || 0;
      
    case 'manual_log':
      // Fixed amount for manual logs
      return 5;
      
    default:
      return 0;
  }
};

// Auto-calculate experience before saving
activitySchema.pre('save', function(next) {
  if (this.isNew) {
    this.experience = this.calculateExperience();
  }
  next();
});

module.exports = mongoose.model('Activity', activitySchema);
