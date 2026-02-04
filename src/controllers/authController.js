const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userModel = require('../models/userModel');
const userOtpModel = require('../models/userOtpModel');
const vehicleModel = require('../models/vehicleModel');
const sendEmail = require('../utils/sendEmail');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const register = async (req, res) => {
    // console.log logs removed for cleaner code
    try {
        const {
            displayName,
            email,
            password,
            countryIso,
            countryName,
            language,
            userTypeId
        } = req.body;

        if (!displayName || !email || !password || !countryIso || !countryName || !language) {
            return sendError(res, 400, 'Missing required fields (displayName, email, password, countryIso, countryName, language)');
        }

        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return sendError(res, 400, 'User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const finalUserTypeId = userTypeId || 1;

        const newUser = await userModel.createUser(
            displayName,
            email,
            passwordHash,
            finalUserTypeId,
            language,
            countryIso,
            countryName
        );

        const allowedDigits = '01234789';
        let otp = '';
        for (let i = 0; i < 6; i++) {
            otp += allowedDigits[Math.floor(Math.random() * allowedDigits.length)];
        }
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await userOtpModel.createOtp(newUser.Id, otp, otpExpiresAt);

        await sendEmail(email, 'Your Verification Code', `Your OTP code is ${otp}. It expires in 10 minutes.`);

        return sendSuccess(res, 201, 'User registered successfully. Please verify your email.', newUser);

    } catch (err) {
        console.error('REGISTRATION ERROR:', err);
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

        // Check if already verified via OTP table
        const isVerified = await userOtpModel.isUserVerified(user.Id);
        if (isVerified) {
            return sendError(res, 400, 'User already verified');
        }

        const otpRecord = await userOtpModel.findLatestOtpByUserId(user.Id);
        if (!otpRecord) {
            return sendError(res, 400, 'No OTP found or expired');
        }

        if (otpRecord.Code !== otp) {
            return sendError(res, 400, 'Invalid OTP');
        }

        if (new Date() > new Date(otpRecord.ExpiresAtUTC)) {
            return sendError(res, 400, 'OTP expired');
        }

        // Mark OTP as used
        await userOtpModel.markOtpAsUsed(otpRecord.Id);

        const token = jwt.sign(
            { id: user.Id, role: user.Role || 'User' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return sendSuccess(res, 200, 'Email verified successfully', {
            user: {
                id: user.Id,
                displayName: user.DisplayName,
                email: user.Email,
                isVerified: true,
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

        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return sendError(res, 400, 'Invalid credentials');
        }

        // Check verification via OTP table
        const isVerified = await userOtpModel.isUserVerified(user.Id);
        if (!isVerified) {
            return sendError(res, 403, 'Please verify your email first.');
        }

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            return sendError(res, 400, 'Invalid credentials');
        }

        const token = jwt.sign(
            { id: user.Id, role: user.Role || 'User' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return sendSuccess(res, 200, 'Login successful', {
            user: user,
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
        // Enrich users with verification status if needed, but for list maybe not strictly required or can be added via join
        return sendSuccess(res, 200, 'Users retrieved successfully', users);
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
