const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const userOtpModel = require('../models/userOtpModel');

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@admin.com';
        const adminPassword = 'admin';
        const adminTypeId = 2; // Admin
        const language = 'English';
        const countryIso = 'US';
        const countryName = 'United States';

        const existingAdmin = await userModel.findUserByEmail(adminEmail);
        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        const newAdmin = await userModel.createUser(
            'Super Admin',
            adminEmail,
            passwordHash,
            adminTypeId,
            language,
            countryIso,
            countryName
        );

        // Create a 'Redeemed' OTP for admin to verify them
        const fakeOtp = '000000';
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        const otpRecord = await userOtpModel.createOtp(newAdmin.Id, fakeOtp, expiresAt);
        await userOtpModel.markOtpAsUsed(otpRecord.Id);

        console.log('Admin user created successfully.');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

    } catch (err) {
        if (err.code === '23505') {
            console.log('Admin user already exists (Constraint violation).');
        } else {
            console.error('Error seeding admin user:', err);
        }
    }
};

module.exports = seedAdmin;
