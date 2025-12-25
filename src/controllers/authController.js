const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
require('dotenv').config();

const sendEmail = require('../utils/sendEmail');
const licensePlateModel = require('../models/licensePlateModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const register = async (req, res) => {
    try {
        const { fullName, email, password, plateNumber } = req.body;

        // Check if user exists
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            // Optional: If user exists but not verified, we could resend OTP here.
            // For now, strict check.
            return sendError(res, 400, 'User already exists');
        }

        // Validate Plate if provided
        if (plateNumber) {
            const existingPlate = await licensePlateModel.findLicensePlateByNumber(plateNumber);
            if (existingPlate) {
                return sendError(res, 400, 'License plate already taken');
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate 4-digit OTP excluding 5 and 6
        const allowedDigits = '01234789';
        let otp = '';
        for (let i = 0; i < 4; i++) {
            otp += allowedDigits[Math.floor(Math.random() * allowedDigits.length)];
        }

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

        return sendSuccess(res, 201, 'User registered successfully. Please verify your email with the OTP sent.', {
            userId: newUser.id,
            email: newUser.email,
            plate: assignedPlate ? assignedPlate.plate_number : null
        });

    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error during registration', err);
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return sendError(res, 400, 'User not found');
        }

        if (user.is_verified) {
            return sendError(res, 400, 'User already verified');
        }

        if (user.otp !== otp) {
            return sendError(res, 400, 'Invalid OTP');
        }

        if (new Date() > new Date(user.otp_expires_at)) {
            return sendError(res, 400, 'OTP expired');
        }

        // Verify User
        const verifiedUser = await userModel.verifyUser(user.id);

        // Generate token
        const token = jwt.sign(
            { id: verifiedUser.id, role: verifiedUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return sendSuccess(res, 200, 'Email verified successfully', {
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
        return sendError(res, 500, 'Server error during verification', err);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return sendError(res, 400, 'Invalid credentials');
        }

        if (!user.is_verified) {
            return sendError(res, 403, 'Please verify your email first.');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return sendError(res, 400, 'Invalid credentials');
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return sendSuccess(res, 200, 'Login successful', {
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
        return sendError(res, 500, 'Server error during login', err);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.findAllUsers();
        return sendSuccess(res, 200, 'Users retrieved successfully', { users });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching users', err);
    }
};

module.exports = {
    register,
    verifyOtp,
    login,
    getAllUsers,
};
