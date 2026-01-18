const express = require('express');
const http = require('http');
// const socketIo = require('socket.io'); // Socket.io removed
const cors = require('cors');
const helmet = require('helmet');
// const messageModel = require('./models/messageModel'); // Message model removed
const vehicleModel = require('./models/vehicleModel');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
// Socket IO initialization removed

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Centra Plate Backend API' });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const searchLogRoutes = require('./routes/searchLogRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/logs', searchLogRoutes);
app.use('/api/reports', reportRoutes);

const seedAdmin = require('./utils/seedAdmin');
const PORT = process.env.PORT || 3000;

// Initialize DB and then start server
db.bootstrapDatabase().then(async () => {
    // Seed Admin
    try {
        await seedAdmin();
    } catch (e) {
        console.error("Seeding admin failed (maybe already exists or schema mismatch):", e);
    }

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
