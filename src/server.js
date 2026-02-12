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
const PORT = process.env.PORT || 8000;

if (!process.env.DATABASE_URL) {
    console.error("FATAL ERROR: DATABASE_URL is not defined in environment variables.");
}

// Initialize DB and then start server
db.bootstrapDatabase().then(async () => {
    // Seed Admin
    try {
        await seedAdmin();
    } catch (e) {
        console.error("Seeding admin failed:", e.message);
    }

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is successfully running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to start server due to DB connection error:", err);
});
