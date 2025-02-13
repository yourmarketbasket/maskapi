const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  challenge: { type: String, required: true }, // Store challenge as binary data
  username: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
