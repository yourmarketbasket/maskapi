const mongoose = require('mongoose');




// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensures unique usernames
  },
  socketid: {
    type: String
  },
  publicKey:{
    // revise type to accept pem
    type: String,
    required: true
  },
  notificationToken: {
    type: String

  },
  online: {
    type: Boolean,
    default: false
  },
  lastSeen:{
    type: Date,
    default: Date.now
  },
  device: {
    type: Object, 
    required: true,
  },
  backupCodes: {
    type: String, 
  }, // Stores currently active device info
  contacts: {
    type: [String],
    default: [],
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});

// Create the user model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
