const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  lastVoteAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to get public profile
voterSchema.methods.getPublicProfile = function() {
  const voterObject = this.toObject();
  delete voterObject.verificationToken;
  return voterObject;
};

module.exports = mongoose.model('Voter', voterSchema);
