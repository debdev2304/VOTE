const mongoose = require('mongoose');
const crypto = require('crypto');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  teams: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    color: {
      type: String,
      default: '#3B82F6'
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  votingUrl: {
    type: String,
    unique: true
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate voting URL before saving
eventSchema.pre('save', function(next) {
  if (!this.votingUrl) {
    this.votingUrl = crypto.randomBytes(16).toString('hex');
  }
  next();
});

// Virtual for checking if event is currently active
eventSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Method to get vote statistics
eventSchema.methods.getVoteStats = function() {
  const stats = {
    totalVotes: this.totalVotes,
    teams: this.teams.map(team => ({
      name: team.name,
      votes: 0,
      percentage: 0
    }))
  };
  
  return stats;
};

// Ensure virtuals are serialized
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
