const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  }
});

// Create the user model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
