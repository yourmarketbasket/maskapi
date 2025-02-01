const User = require('../models/user');
const crypto = require('crypto');
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
//   

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
      const password = UserService.generatePassword();
      const newUser = new User({ username: username, password: password });
      await newUser.save();

      return {
        success: true,
        password: password,
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
  // generate password
  static generatePassword() {
        const length = 36;
        const blockSize = 4;
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
        let password = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars.charAt(randomIndex);

            // Add a hyphen after every 4 characters, except at the end
            if ((i + 1) % blockSize === 0 && i !== length - 1) {
                password += '-';
            }
        }

        return password.toUpperCase();
    }
    static async generateRegistrationChallenge(data) {
      let user = await User.findOne({ username: data.username });
  
      if (!user) {
          user = new User({
              username: data.username,
              credentials: [],
              backupCodes: [],
              activeDevice: {
                  model: data.device.model,
                  brand: data.device.brand || null, // Android only
                  manufacturer: data.device.manufacturer || null, // Android only
                  systemName: data.device.systemName,
                  systemVersion: data.device.systemVersion,
                  identifierForVendor: data.device.identifierForVendor || data.device.serialNo || null, // iOS & Android
                  serialNo: data.device.serialNo || null, // Android only
                  isPhysicalDevice: data.device.isPhysicalDevice,
                  display: data.device.display || null, // Android only
                  device: data.device.device || null, // Android only
                  name: data.device.name || null, // iOS only
                  utsnameMachine: data.device.utsnameMachine || null,// iOS only
                  operatingSystem: data.devive.OS
              },
              contacts: [],
              hidden: false
          });
          await user.save();
      }
  
      const challenge = UserService.generateChallenge();
      const userId = Buffer.from(user.username).toString('base64');
  
      return {
          authenticatorExtensions: "",
          clientDataHash: challenge,
          credTypesAndPubKeyAlgs: [["public-key", -7]],
          excludeCredentials: user.credentials.map(credential => ({
              type: "public-key",
              id: Buffer.from(credential.credentialId).toString('base64')
          })),
          requireResidentKey: true,
          requireUserPresence: false,
          requireUserVerification: true,
          rp: {
              name: "mask_app",
              id: "mask_app"
          },
          user: {
              name: user.username,
              displayName: user.username,
              id: userId
          }
      };
  }
  


  // generate challenge
  static generateChallenge(){
      return Buffer.from(crypto.randomBytes(32)).toString('base64');
  }
    
  
}

module.exports = UserService; // Export the class, not an instance
