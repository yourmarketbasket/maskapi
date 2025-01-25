// setup for mongodb
const mongoose = require('mongoose');

// connect to mongodb
const connection = async () => {
    console.log("all good")
    try {
        // get uri from .env
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = connection;