const admin = require('firebase-admin');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const http = require('http');
const { checkDBConnection, closeDBConnection } = require('./middleware/db');
const { Server } = require('socket.io');
const UserService = require('./services/userServices');
const app = express();
const PORT = 3000;

app.use(express.json());

// Create server with socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this for specific client URLs
        methods: ["GET", "POST"],
    },
});

// Middleware to attach `io` to `req`
app.use((req, res, next) => {
    req.io = io; // Attach `io` to `req` for use in routes
    next();
});

var serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



// Import routes and pass `io` directly
const authRoutes = require('./routes/authRoutes')(io);
const userRoutes = require('./routes/userRoutes')(io);
const messageRoutes = require('./routes/messageRoutes')(io);
const aiRoutes = require('./routes/aiRoutes')(io);

// Use routes
app.use('/authRoutes', authRoutes);
app.use('/userRoutes', userRoutes);
app.use('/messageRoutes', messageRoutes);
app.use('/aiRoutes', aiRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('Hello World!');
    checkDBConnection(); // Ensure DB connection is checked here
});

app.use('/.well-known', express.static('well-known'));

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('userStatus', (data) => {
        console.log(data)
    });

    // Handle custom events
    socket.on('message', (data) => {
        console.log(`Message received: ${data}`);
        io.emit('message', data); // Broadcast message to all connected clients
    });

    // Handle disconnection
    socket.on('disconnect', async() => {
        console.log(`A user disconnected: ${socket.id}`);
        await UserService.markOffline(socket.id, io);
    });

    // handle online status change
    socket.on('online-status', async (data) => {
        console.log(data)
        // update the database
        await UserService.markOnline(data.username, data.socketId, io);
    });
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

// Ensure server shutdown gracefully closes DB connections
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await closeDBConnection();
    process.exit(0);
});
