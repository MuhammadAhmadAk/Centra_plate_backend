const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@admin.com';
        const adminPassword = 'admin';
        const adminRole = 'admin';

        // Check if admin exists
        const existingAdmin = await userModel.findUserByEmail(adminEmail);
        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        // Note: OTP fields are null, verified is true
        // createUser signature: (fullName, email, passwordHash, role, otp, otpExpiresAt)
        // We'll trust that createUser sets default values or handles nulls, 
        // but model currently expects them. We should adjust logic or provide nulls.

        // Actually, userModel.createUser returns just the user.
        // We need to ensure is_verified is TRUE.

        const newAdmin = await userModel.createUser('Super Admin', adminEmail, passwordHash, adminRole, null, null);

        // Manually verify admin
        await userModel.verifyUser(newAdmin.id);

        console.log('Admin user created successfully.');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

    } catch (err) {
        console.error('Error seeding admin user:', err);
    }
};

module.exports = seedAdmin;
