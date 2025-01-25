// main server file (index.js or app.js)
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const http = require('http');
const { checkDBConnection, closeDBConnection } = require('./middleware/db');

const { Server } = require("socket.io");
const app = express();
const PORT = 5500;

app.use(express.json());
// Create server with socket.io
const server = http.createServer(app);
const io = new Server(server);

// Import routes
const authRoutes = require('./routes/authRoutes')(io);
const userRoutes = require('./routes/userRoutes')(io);


// Use routes
app.use('/authRoutes', authRoutes);
app.use('/userRoutes', userRoutes);


// Home route
app.get('/', (req, res) => {
    res.send('Hello World!');
    // Ensure DB connection is checked here
    checkDBConnection();
});






// Start server
server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    const isConnected = await checkDBConnection();

    if (!isConnected) {
        console.error('Failed to connect to the database. Shutting down the server...');
        process.exit(1); // Exit the process if the DB connection fails
    }
});

