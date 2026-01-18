const db = require('../config/db');

const checkUsers = async () => {
    try {
        console.log('--- Checking "User" Table ---');
        // Note the double quotes around User, otherwise Postgres looks for 'user' (lowercase) which might not exist or be wrong
        const res = await db.query('SELECT * FROM "User"');
        console.log(`Found ${res.rows.length} users.`);
        if (res.rows.length > 0) {
            console.log('First User Keys:', Object.keys(res.rows[0]));
            console.log('First User Data:', res.rows[0]);
        }

        console.log('\n--- Checking "UserOtpVerification" Table ---');
        const otpRes = await db.query('SELECT * FROM "UserOtpVerification"');
        console.log(`Found ${otpRes.rows.length} OTP records.`);
        if (otpRes.rows.length > 0) {
            console.log('First OTP Data:', otpRes.rows[0]);
        }

    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        process.exit();
    }
};

checkUsers();
