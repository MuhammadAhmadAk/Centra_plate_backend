const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const messageModel = require('./models/messageModel');
const licensePlateModel = require('./models/licensePlateModel');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Configure this accurately for production
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Centra Plate Backend API' });
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Custom event to join user-specific channel
    socket.on('identify', async (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} identified and joined their private room.`);

        // Also join plate room if exists (allows future plate-wide broadcasts)
        try {
            const plate = await licensePlateModel.findLicensePlateByUserId(userId);
            if (plate) {
                socket.join(`plate_${plate.plate_number}`);
                console.log(`User ${userId} joined plate room: plate_${plate.plate_number}`);
            }
        } catch (err) {
            console.error('Error joining plate room:', err);
        }
    });

    socket.on('send_message', async (data) => {
        // Expected data: { senderId, receiverId, receiverPlate, content }

        if (!data.senderId || !data.content) {
            // invalid payload
            return;
        }

        let targetUserId = data.receiverId;

        try {
            // Priority 1: If Plate provided, resolve to User
            if (data.receiverPlate) {
                const plate = await licensePlateModel.findLicensePlateByNumber(data.receiverPlate);
                if (plate) {
                    targetUserId = plate.user_id;
                } else if (!targetUserId) {
                    // Only error if we didn't also have a receiverId fallback
                    socket.emit('error', { message: 'License plate not found' });
                    return;
                }
            }

            if (!targetUserId) {
                socket.emit('error', { message: 'Receiver not specified or found' });
                return;
            }

            // Save to DB
            const savedMessage = await messageModel.createMessage(data.senderId, targetUserId, data.content);

            // Emit to receiver's User Room
            io.to(`user_${targetUserId}`).emit('receive_message', savedMessage);

            // Emit confirmation to sender
            socket.emit('message_sent', savedMessage);

        } catch (err) {
            console.error('Error saving message:', err);
            socket.emit('error', { message: 'Server error processing message' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Routes (Placeholders for now)
const authRoutes = require('./routes/authRoutes');
const licensePlateRoutes = require('./routes/licensePlateRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/plates', licensePlateRoutes);

const seedAdmin = require('./utils/seedAdmin');
const PORT = process.env.PORT || 3000;

// Initialize DB and then start server
db.bootstrapDatabase().then(async () => {
    // Seed Admin
    await seedAdmin();

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
