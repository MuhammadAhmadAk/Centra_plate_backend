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
            user: user,
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

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findUserById(userId);
        if (!user) {
            return sendError(res, 404, 'User not found');
        }
        return sendSuccess(res, 200, 'Profile retrieved successfully', user);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching profile', err);
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        let { displayName, bio, profilePicURL, language, countryIso, countryName } = req.body;

        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            profilePicURL = `${baseUrl}/public/uploads/${req.file.filename}`;
        }

        const updatedUser = await userModel.updateUser(userId, {
            displayName,
            bio,
            profilePicURL,
            language,
            countryIso,
            countryName
        });

        if (!updatedUser) {
            return sendError(res, 404, 'User not found');
        }

        return sendSuccess(res, 200, 'Profile updated successfully', updatedUser);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error updating profile', err);
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendError(res, 400, 'Current password and new password are required');
        }

        const user = await userModel.findUserByEmail(req.user.email || (await userModel.findUserById(userId)).Email);

        // Fetch full user including password hash if findUserById doesn't return it
        // Actually findUserByEmail returns everything. Let's use ID but we need password hash.
        const fullUser = await userModel.findUserByEmail((await userModel.findUserById(userId)).Email);

        const isMatch = await bcrypt.compare(currentPassword, fullUser.PasswordHash);
        if (!isMatch) {
            return sendError(res, 400, 'Invalid current password');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await userModel.updatePassword(userId, passwordHash);

        return sendSuccess(res, 200, 'Password changed successfully');
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error changing password', err);
    }
};

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return sendError(res, 400, 'Password is required to delete account');
        }

        const user = await userModel.findUserById(userId);
        if (!user) {
            return sendError(404, 'User not found');
        }

        // Need to get full user to verify password hash
        const fullUser = await userModel.findUserByEmail(user.Email);

        const isMatch = await bcrypt.compare(password, fullUser.PasswordHash);
        if (!isMatch) {
            return sendError(res, 401, 'Invalid password. Account deletion aborted.');
        }

        await userModel.deleteUser(userId);

        return sendSuccess(res, 200, 'Account and all related data deleted successfully');
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error during account deletion', err);
    }
};

module.exports = {
    register,
    verifyOtp,
    login,
    getAllUsers,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
};
