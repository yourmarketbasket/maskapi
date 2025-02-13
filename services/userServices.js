const User = require('../models/user');
const crypto = require('crypto');
const Fido2Lib = require("fido2-lib");
const fido2 = new Fido2Lib.Fido2Lib();
const { generateRegistrationOptions } = require('@simplewebauthn/server');
const { isoUint8Array } = require('@simplewebauthn/server/helpers');
const Challenge = require('../models/challenges');
const { verifyRegistrationResponse } = require('@simplewebauthn/server');

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
  static async registerUser(username) {
    try {
      const { exists, success } = await UserService.checkUsernameExists(username);
      if (!success) {
        throw new Error('Failed to check username existence.');
      }
      if (exists) {
        return {
          success: false,
          message: 'Username already taken',
        };
      }

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

  static async generateWebAuthnRegistrationOptions(data) {

    // Helper function to generate a random challenge
    const generateChallenge = () => Buffer.from(crypto.randomBytes(32)).toString('base64'); // Generates a 32-byte random string

    // Generate a unique challenge for registration
    const challenge = generateChallenge();

    // Convert the username to a Uint8Array using isoUint8Array helper
    const userID = isoUint8Array.fromUTF8String(data.username); // Convert username to Uint8Array

    // WebAuthn registration options
    const options = generateRegistrationOptions({
      rpName: 'com.example.mask_app',           // The name of your application
      rpID: 'https://maskapi.fly.dev',           // The domain of your application (adjust for production)
      userID: userID,              // Use the Uint8Array version of the username as userID
      userName: data.username,     // The username provided by the user
      userDisplayName: data.username, // The display name for the user (can be different from username)
      challenge: challenge,        // The generated challenge to sign during registration
      timeout: 60000,              // Timeout for the WebAuthn request (60 seconds)
      attestationType: 'none',     // Attestation type (can be 'none', 'indirect', or 'direct')
    });

    // Returning the WebAuthn registration options
    return options;
  }

  static async verifyWebAuthnAttestation(data) {
    console.log("Received attestation data:", JSON.stringify(data, null, 2));

    try {
        let { username, attestation } = data;

        // If attestation is a string, parse it into an object
        if (typeof attestation === "string") {
            try {
                attestation = JSON.parse(attestation);
            } catch (parseError) {
                console.error("Failed to parse attestation JSON:", parseError);
                return { success: false, message: "Invalid attestation data format." };
            }
        }

        // Retrieve the challenge record (or registration options) from your database
        const challengeRecord = await Challenge.findOne({ username });
        if (!challengeRecord) {
            return { success: false, message: "Challenge not found." };
        }

        // Define your expected values for verification
        const expectedOrigin = "https://maskapi.fly.dev";
        // The RP ID is typically the domain of your origin. You can also extract the hostname if needed.
        const expectedRPID = expectedOrigin;
        const expectedChallenge = challengeRecord.challenge; // The challenge you stored earlier

        console.log("Validating attestation with challenge:", expectedChallenge);

        // Verify the registration response (attestation)
        const verification = await verifyRegistrationResponse({
            response: attestation,
            expectedChallenge, // This should be the exact challenge you sent to the client
            expectedOrigin,
            expectedRPID,
        });

        console.log("Verification result:", verification);

        if (verification.verified) {
            // Additional processing (e.g., saving the credential to your database)
            return { success: true, verification };
        } else {
            return { success: false, message: "Attestation could not be verified." };
        }
    } catch (error) {
        console.error("Error during attestation verification:", error);
        return { success: false, message: "Internal server error." };
    }
}



  



 static async generateRegistrationChallenge(data) {
    try {
      console.log("Starting generateRegistrationChallenge...");
  
      let user = await User.findOne({ username: data.username });
  
      if (!user) {
        console.log("User not found. Creating new user...");
        user = new User({
          username: data.username,
          credentials: [],
          backupCodes: UserService.generatePassword(),
          activeDevice: {
            model: data.device.model,
            brand: data.device.brand || null,
            manufacturer: data.device.manufacturer || null,
            systemName: data.device.systemName,
            systemVersion: data.device.systemVersion,
            identifierForVendor: data.device.identifierForVendor || data.device.serialNo || null,
            serialNo: data.device.serialNo || null,
            display: data.device.display || null,
            device: data.device.device || null,
            name: data.device.name || null,
            utsnameMachine: data.device.utsnameMachine || null,
            operatingSystem: data.device.operatingSystem
          },
          contacts: [],
          hidden: false
        });
        // await user.save();
        console.log("New user created and saved.");
      } else {
        console.log("User found:", user.username);
      }
  
      const challenge = UserService.generateChallenge();
      console.log("Challenge generated:", challenge);
  
      const userId = Buffer.from(user.username).toString('base64');
      console.log("User ID:", userId);
  
      let excludeCredentials = [];
  
      if (user.credentials && user.credentials.length > 0) {
        excludeCredentials = user.credentials.map(credential => {
          if (!credential.credentialId) {
            console.log("Credential does not have a credentialId.");
          } else {
            const rawId = Buffer.from(credential.credentialId); // Ensure rawId is correctly encoded
            const id = rawId.toString('base64'); // Convert rawId to a string
  
            console.log("Found credentialId, rawId and id:", credential.credentialId, rawId.toString('base64'), id);
  
            return {
              type: "public-key",
              rawId: rawId.toString('base64'),  // Raw ID as base64 string
              id: id,  // ID as base64 string
            };
          }
        }).filter(Boolean); // Remove any undefined values
      } else {
        console.log("No credentials found for the user, generating new rawId and id...");
  
        // Generate new random rawId and id for new user
        const newRawId = crypto.randomBytes(16).toString('base64'); // 16 bytes of random data
        const newId = newRawId; // Using the same rawId as id for simplicity
  
        console.log("Generated new rawId and id:", newRawId, newId);
  
        excludeCredentials.push({
          type: "public-key",
          rawId: newRawId, // New generated rawId as base64 string
          id: newId, // New generated id as base64 string
        });
      }
      // save challenge to database
      await Challenge.create({
        challenge: challenge,
        username: user.username
      })
  
      return {
        authenticatorExtensions: "",
        clientDataHash: challenge,
        credTypesAndPubKeyAlgs: [["public-key", -7]],
        excludeCredentials: excludeCredentials,
        requireResidentKey: true,
        requireUserPresence: false,
        requireUserVerification: true,
        rp: {
          name: "com.example.mask_app",
          id: "https://maskapi.fly.dev"
        },
        user: {
          name: user.username,
          displayName: user.username,
          id: userId
        },
        rawId: excludeCredentials.map(cred => cred.rawId).join(''), // Joining all rawIds if multiple
        id: excludeCredentials.map(cred => cred.id).join(''), // Joining all ids if multiple
      };
    } catch (error) {
      console.error("Error in generateRegistrationChallenge:", error);
      throw new Error("Failed to generate registration challenge");
    }
  }
  


  // Save credentials
  static async saveCredentials(data) {
    try {
      const { username, attestationData, challenge, rawId, id } = data;
  
      // Validate if required fields are passed
      if (!username || !attestationData || !challenge || !rawId || !id) {
        return { success: false, message: 'Missing required data fields: username, attestationData, challenge, rawId, id.' };
      }
  
      // Validate factor value
      const factor = attestationData.factor || 'either';
      if (!['first', 'second', 'either'].includes(factor)) {
        return { success: false, message: 'Invalid factor value. Expected "first", "second", or "either".' };
      }
  
      // Parse and validate attestation data
      let attestation;
      try {
        attestation = JSON.parse(attestationData);
      } catch (err) {
        console.error("Failed to parse attestation data:", err);
        return { success: false, message: 'Invalid attestation data format.' };
      }
  
      // Ensure required fields are present in attestation
      if (!attestation.authData || !attestation.fmt || !attestation.attStmt) {
        console.error('Attestation data missing required fields:', attestation);
        return { success: false, message: 'Missing required attestation data fields.' };
      }
  
      // Convert rawId (if passed as base64url string) to ArrayBuffer
      if (rawId) {
        if (typeof rawId === 'string') {
          try {
            // Decode base64url to base64, then convert it to ArrayBuffer
            const decoded = atob(rawId.replace(/_/g, '/').replace(/-/g, '+')); // base64url to base64
            attestation.rawId = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0))).buffer; // Convert to ArrayBuffer
          } catch (err) {
            console.error("Error decoding rawId:", err);
            return { success: false, message: 'Invalid rawId format. Could not decode base64url.' };
          }
        } else {
          return { success: false, message: 'Invalid rawId format. Expected base64url string.' };
        }
      } else {
        return { success: false, message: 'Missing rawId in data.' };
      }
  
      // Assign id (as string)
      if (id) {
        attestation.id = id;
      } else {
        return { success: false, message: 'Missing id in data.' };
      }
  
      // Ensure challenge is present
      if (!challenge) {
        return { success: false, message: 'Challenge not found. Ensure the registration process is correctly initialized.' };
      }
  
  
      // Call attestationResult with proper parameters
      const attestationResult = await fido2.attestationResult(attestation, {
        challenge: challenge,
        origin: "http://localhost:3000", 
        factor: factor,
      });
  
      // Log the attestationResult to check the output
      console.log("Attestation result:", attestationResult);
  
      // Find the user
      const user = await User.findOne({ username: username });
      if (!user) {
        console.error(`User not found: ${username}`);
        return { success: false, message: 'User not found.' };
      }
  
      // Save the credentials to the user record
      user.credentials.push(attestationResult);
      await user.save();
  
      return { success: true, message: 'Credentials saved successfully.' };
  
    } catch (err) {
      // Catch all errors
      console.error("Error during registration response handling:", err);
      return { success: false, message: 'Error during credential saving process.' };
    }
  }
  






  // Generate challenge
  static generateChallenge() {
    return Buffer.from(crypto.randomBytes(32)).toString('base64');
  }
}

module.exports = UserService;
