const mongoose = require('mongoose');
require('dotenv').config();

let isDBConnected = false; // Flag to track the database connection state

// Initialize Mongoose Connection
async function checkDBConnection() {
    try {
        if (!isDBConnected) {
            // Attempt to connect to MongoDB using Mongoose
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // Optional timeout for initial connection
            });
            isDBConnected = true; // Set the connection flag
            console.log('Connected to MongoDB using Mongoose');
        }

        // Confirm the connection is still valid by checking the connection state
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Mongoose connection is not active');
        }

        return true; // Connection is active
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);

        // Reset the connection flag on error
        isDBConnected = false;

        // Attempt to disconnect on failure
        await closeDBConnection();
        return false; // Connection failed
    }
}

// Close the MongoDB connection when the server shuts down
async function closeDBConnection() {
    try {
        if (isDBConnected) {
            await mongoose.disconnect();
            isDBConnected = false;
            console.log('Disconnected from MongoDB using Mongoose');
        }
    } catch (error) {
        console.error('Error while disconnecting MongoDB:', error);
    }
}

module.exports = {
    checkDBConnection,
    closeDBConnection,
};
