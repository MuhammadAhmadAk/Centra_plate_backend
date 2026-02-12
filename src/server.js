require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
// const socketIo = require('socket.io'); // Socket.io removed
const cors = require('cors');
const helmet = require('helmet');
// const messageModel = require('./models/messageModel'); // Message model removed
const vehicleModel = require('./models/vehicleModel');
const db = require('./config/db');

const app = express();
const server = http.createServer(app);
// Socket IO initialization removed

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Centra Plate Backend API' });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const searchLogRoutes = require('./routes/searchLogRoutes');
const reportRoutes = require('./routes/reportRoutes');
const systemRoutes = require('./routes/systemRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/logs', searchLogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/system', systemRoutes);

const seedAdmin = require('./utils/seedAdmin');
const PORT = process.env.PORT || 4000;

console.log("--- Initializing Centra Plate Backend ---");
console.log(`Target Port: ${PORT}`);
console.log(`DATABASE_URL detected: ${process.env.DATABASE_URL ? "YES (Hidden)" : "NO"}`);

// Start server immediately for health checks
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is proactively listening on port ${PORT}`);
});

// Initialize DB in background
console.log("Attempting to connect to PostgreSQL...");
db.bootstrapDatabase().then(async () => {
    console.log("Database connection established.");
    try {
        await seedAdmin();
        console.log("Admin seeding check completed.");
    } catch (e) {
        console.error("Seeding admin error:", e.message);
    }
}).catch(err => {
    console.error("CRITICAL: Database connection failed!");
    console.error("Error details:", err.message);
});
