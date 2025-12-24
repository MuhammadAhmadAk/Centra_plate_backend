const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
require('dotenv').config();

const sendEmail = require('../utils/sendEmail');
const licensePlateModel = require('../models/licensePlateModel');

const register = async (req, res) => {
    try {
        const { fullName, email, password, plateNumber } = req.body;

        // Check if user exists
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            // Optional: If user exists but not verified, we could resend OTP here.
            // For now, strict check.
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate Plate if provided
        if (plateNumber) {
            const existingPlate = await licensePlateModel.findLicensePlateByNumber(plateNumber);
            if (existingPlate) {
                return res.status(400).json({ message: 'License plate already taken' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Create user
        const newUser = await userModel.createUser(fullName, email, passwordHash, 'user', otp, otpExpiresAt);

        // Assign Plate if provided
        let assignedPlate = null;
        if (plateNumber) {
            try {
                assignedPlate = await licensePlateModel.createLicensePlate(newUser.id, plateNumber);
            } catch (plateErr) {
                console.error("Error assigning plate during registration:", plateErr);
                // Note: User is created but plate failed. We won't rollback user here for simplicity,
                // but user will have to retry assigning plate later.
            }
        }

        // Send OTP Email
        await sendEmail(email, 'Your Verification Code', `Your OTP code is ${otp}. It expires in 10 minutes.`);

        res.status(201).json({
            message: 'User registered successfully. Please verify your email with the OTP sent.',
            userId: newUser.id,
            email: newUser.email,
            plate: assignedPlate ? assignedPlate.plate_number : null
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Verify User
        const verifiedUser = await userModel.verifyUser(user.id);

        // Generate token
        const token = jwt.sign(
            { id: verifiedUser.id, role: verifiedUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Email verified successfully',
            user: {
                id: verifiedUser.id,
                fullName: verifiedUser.full_name,
                email: verifiedUser.email,
                role: verifiedUser.role,
                isVerified: verifiedUser.is_verified
            },
            token,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ message: 'Please verify your email first.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = {
    register,
    verifyOtp,
    login,
};
