const User = require('../models/user');
class UserService {
  // Check if the username already exists in the database
  static async checkUsernameExists(username) {
    try {
      const existingUser = await User.findOne({ username: username });
      return {
        success: true,
        exists: !!existingUser, // true if user exists, false otherwise
      };
    } catch (err) {
      // Handle database-specific errors
      if (err.name === 'MongoServerError') {
        return {
          success: false,
          message: 'Database server error. Please try again later.',
        };
      }
      // Handle other errors
      return {
        success: false,
        message: err.message || 'An unexpected error occurred.',
      };
    }
  }

  // Register a new user
  static async registerUser(username) {
    try {
      // Check if the username already exists
      const {exists, success} = await UserService.checkUsernameExists(username);
      console.log(exists)
      if (!success) {
        throw new Error('Failed to check username existence.');
      }
      if (exists) {
        return {
          success: false,
          message: 'Username already taken',
        };
      }

      // Create and save the new user
      const newUser = new User({ username });
      await newUser.save();

      return {
        success: true,
        user: newUser,
      };
    } catch (err) {
      console.error('Error registering user:', err);
      return {
        success: false,
        message: err.message || 'Error registering user.',
      };
    }
  }
}

module.exports = UserService; // Export the class, not an instance
