const mongoose = require('mongoose');

// Define the device information schema
const deviceSchema = new mongoose.Schema({
  model: { type: String, required: true }, // Device model (e.g., iPhone 12, Pixel 5)
  brand: { type: String }, // Brand (Android only)
  manufacturer: { type: String }, // Manufacturer (e.g., Samsung, Apple)
  systemName: { type: String, required: true }, // OS name (e.g., Android, iOS)
  systemVersion: { type: String, required: true }, // OS version (e.g., 14.4, 11)
  identifierForVendor: { type: String }, // Unique ID for iOS (Android equivalent: serialNumber)
  serialNo: { type: String }, // Serial number (Android only)
  isPhysicalDevice: { type: Boolean, required: true }, // Whether it's a physical device
  display: { type: String }, // Display name/version (Android only)
  device: { type: String }, // Device identifier (Android only)
  name: { type: String }, // Device name (iOS only)
  utsnameMachine: { type: String }, // Device architecture (e.g., x86_64, arm64)
  operatingSystem: { type: String, required: true },
});

// Define the WebAuthn credential schema
const credentialSchema = new mongoose.Schema({
  credentialId: {
    type: String,
    required: true,
    unique: true, // Ensures credential uniqueness
  },
  publicKey: {
    type: String,
    required: true,
  },
  counter: {
    type: Number,
    default: 0, // Helps prevent replay attacks
  },
  deviceInfo: deviceSchema, // Stores device information
});

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensures unique usernames
  },
  credentials: {
    type: [credentialSchema], // Supports multiple credentials
    default: [],
  },
  backupCodes: {
    type: [String], // Array of backup codes for recovery
    default: [],
  },
  activeDevice: deviceSchema, // Stores currently active device info
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
