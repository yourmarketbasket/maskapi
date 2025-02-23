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
      if (err.name === 'MongoServerError') {
        return {
          success: false,
          exists: false,
          message: 'Database server error. Please try again later.',
        };
      }
      return {
        success: false,
        exists: false,
        message: 'An unexpected error occurred.',
      };
    }
  }

  // Add contact
  static async addContact(username, contact, io) {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }

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
  static async registerUser(data) {
    // console.log(data);
    try {
      const { exists, success } = await UserService.checkUsernameExists(data.username);
      if (!success) {
        throw new Error('Failed to check username existence.');
      }
      if (exists) {
        return {
          success: false,
          message: 'Username already taken',
        };
      }

      const backupCodes = UserService.generatePassword();
      const newUser = new User({ username: data.username, backupCodes: backupCodes, publicKey: data.public_key, device: data.device_details, contacts: [], hidden: false });
      await newUser.save();

      return {
        success: true,
        password: backupCodes,
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
  // Get user by username and return only the username and public key
  static async getUserByUsername(username) {
    try {
      const user = await User.findOne({ username });
      return {
        success: true,
        user: {username: user.username, publicKey: user.publicKey, device: user.device},
        message: 'User found.',
      };
    } catch (err) {
      console.error('Error getting user by username:', err);
      return {
        success: false,
        message: 'Error getting user by username.',
      };
    }
  }
  // add socket id to user
  static async markOnline(username, socketId, io) {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }
      user.socketid = socketId;
      user.online = true;
      await user.save();
      io.emit('user-online', { username, status: true });
      return {
        success: true,
        message: 'Socket ID added successfully.',
      };
    } catch (err) {
      console.error('Error adding socket ID:', err);
      return {
        success: false,
        message: 'Error adding socket ID.',
      };
    }
  }
  // update user details with public key and device details
  static async updateUserDetails(data) {
    try {
      const user = await User.findOne({ username: data.username });
      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }
      user.publicKey = data.publicKey;
      user.device = data.device;
      await user.save();
      return {
        success: true,
        message: 'User details updated successfully.',
      };
    } catch (err) {
      console.error('Error updating user details:', err);
      return {
        success: false,
        message: 'Error updating user details.',
      };
    }
  }
  // mark user as offline based on socketid
  static async markOffline(socketId, io) {
    try {
      const user = await User.findOne({ socketid: socketId });
      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }
      user.online = false;
      user.socketid = socketId;
      user.lastSeen = new Date();
      await user.save();
      io.emit('user-online', { username: user.username, status: false });
      return {
        success: true,
        message: 'User marked as offline successfully.',
      };
    } catch (err) {
      console.error('Error marking user offline:', err);
      return {
        success: false,
        message: 'Error marking user offline.',
      };
    }
  }
  // toggle online status route
  static async toggleOnlineStatus(username, status, io) {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }
      user.online = status;
      user.lastSeen = new Date();
      await user.save();
      io.emit('user-online', { username, status });
      return {
        success: true,
        message: 'Online status toggled successfully.',
      };
    } catch (err) {
      console.error('Error toggling online status:', err);
      return {
        success: false,
        message: 'Error toggling online status.',
      };
    }
    
  }

  // validate backup codes
  static async validateBackupCodes(data) {
    try {
      const user = await User.findOne({ username: data.username });
      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }
      // backup code format: MZK!-VKJ#-Q#4J-TJRQ-PIE6-P4QL-OXLB-6PZU-CHX#
      // check if the provided code1 matches block1 of 4chars and if code2 matches block2 of 4chars, the block number is provided dynamically as block1 or block2
      // split the user.backupcodes by hypthen and check if the provided code1 matches block1 of 4chars and if code2 matches block2 of 4chars
      const codes = user.backupCodes.split('-');
      const block1 = codes[data.blockno1-1];
      const block2 = codes[data.blockno2-1];
      if (block1 === data.code1 && block2 === data.code2) {
        return {
          success: true,
          username: user.username,
          message: 'Backup codes are valid.',
        };
      }
      
      return {
        success: false,
        message: 'Invalid backup codes.',
      };
    } catch (err) {
      console.error('Error validating backup codes:', err);
      return {
        success: false,
        message: 'Error validating backup codes.',
      };
    }
  }
  

  // Get all users
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

  // Get my contacts
  static async getMyContacts(username) {
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

  // Generate password
  static generatePassword() {
    const length = 36;
    const blockSize = 4;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars.charAt(randomIndex);

      if ((i + 1) % blockSize === 0 && i !== length - 1) {
        password += '-';
      }
    }

    return password.toUpperCase();
  }

 

 


  


  


 
}

module.exports = UserService;
