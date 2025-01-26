const User = require('../models/user');
class UserService {
  // Check if the username already exists in the database
  static async checkUsernameExists(username) {
    try {
      const existingUser = await User.findOne({ username: username });
      return {
        success: true,
        exists: existingUser !== null,
        message: "User exists", // true if user exists, false otherwise
      };
    } catch (err) {
      // Handle database-specific errors
      if (err.name === 'MongoServerError') {
        return {
          success: false,
          exists: false,
          message: 'Database server error. Please try again later.',
        };
      }
      // Handle other errors
      return {
        success: false,
        exists: false,
        message: 'An unexpected error occurred.',
      };
    }
  }
//   add contact
  static async addContact(username, contact, io) {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }
    //   check if contact exists in the contact array
      if (user.contacts.includes(contact)) {
        return {
          success: false,
          message: 'Contact already exists.',
        };
      }

      user.contacts.push(contact);
      await user.save();
      io.emit('contact-added', { username, contact });
      return {
        success: true,
        message: 'Contact added successfully.',
      };
    } catch (err) {
      console.error('Error adding contact:', err);
      return {
        success: false,
        message: 'Error adding contact.',
      };
    }
  }

  // Register a new user
  static async registerUser(username) {
    try {
      // Check if the username already exists
      const {exists, success} = await UserService.checkUsernameExists(username);
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
        message: "Registration Successful",
      };
    } catch (err) {
      console.error('Error registering user:', err);
      return {
        success: false,
        message: 'Error registering user.',
      };
    }
  }
//   get all users
  static async getAllUsers() {
    try {
      const users = await User.find();
      return {
        success: true,
        users,
      };
    } catch (err) {
      console.error('Error getting users:', err);
      return {
        success: false,
        message: 'Error getting users.',
      };
    }
  }
//   get my contacts
  static async getMyContacts(username) {
    // console.log(username)
    try {
      const user = await User.findOne({ username });
      return {
        success: true,
        contacts: user.contacts,
      };
    } catch (err) {
      console.error('Error getting my contacts:', err);
      return {
        success: false,
        message: 'Error getting my contacts.',
      };
    }
  }
}

module.exports = UserService; // Export the class, not an instance
