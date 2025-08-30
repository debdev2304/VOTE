const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voter',
    required: true
  },
  team: {
    type: String,
    required: true
  },
  votedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

// Compound index to ensure one vote per voter per event
voteSchema.index({ event: 1, voter: 1 }, { unique: true });

// Method to get vote details
voteSchema.methods.getVoteDetails = function() {
  return {
    id: this._id,
    event: this.event,
    voter: this.voter,
    team: this.team,
    votedAt: this.votedAt
  };
};

module.exports = mongoose.model('Vote', voteSchema);
