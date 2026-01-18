const db = require('../config/db');

// Create OTP
const createOtp = async (userId, otp, expiresAt) => {
    const query = `
        INSERT INTO "UserOtpVerification" ("UserId", "Code", "ExpiresAtUTC")
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [userId, otp, expiresAt];
    const result = await db.query(query, values);
    return result.rows[0];
};

// Find Latest OTP by UserId
const findLatestOtpByUserId = async (userId) => {
    const query = `
        SELECT * FROM "UserOtpVerification"
        WHERE "UserId" = $1 AND "Redeemed" = FALSE
        ORDER BY "CreatedAtUTC" DESC
        LIMIT 1;
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
};

// Mark OTP as used
const markOtpAsUsed = async (otpId) => {
    const query = `
        UPDATE "UserOtpVerification"
        SET "Redeemed" = TRUE
        WHERE "Id" = $1;
    `;
    await db.query(query, [otpId]);
};

// Check if User is Verified (has at least one Redeemed OTP)
const isUserVerified = async (userId) => {
    const query = `
        SELECT "Id" FROM "UserOtpVerification"
        WHERE "UserId" = $1 AND "Redeemed" = TRUE
        LIMIT 1;
    `;
    const result = await db.query(query, [userId]);
    return result.rows.length > 0;
};

module.exports = {
    createOtp,
    findLatestOtpByUserId,
    markOtpAsUsed,
    isUserVerified,
};
