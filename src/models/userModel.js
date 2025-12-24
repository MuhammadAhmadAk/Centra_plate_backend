const db = require('../config/db');

const createUser = async (fullName, email, passwordHash, role = 'user', otp = null, otpExpiresAt = null) => {
    const query = `
    INSERT INTO users (full_name, email, password_hash, role, otp, otp_expires_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, full_name, email, role, created_at, is_verified;
  `;
    const values = [fullName, email, passwordHash, role, otp, otpExpiresAt];
    const result = await db.query(query, values);
    return result.rows[0];
};

const verifyUser = async (id) => {
    const query = 'UPDATE users SET is_verified = TRUE, otp = NULL, otp_expires_at = NULL WHERE id = $1 RETURNING id, full_name, email, role, is_verified';
    const result = await db.query(query, [id]);
    return result.rows[0];
};

const updateUserOtp = async (id, otp, otpExpiresAt) => {
    const query = 'UPDATE users SET otp = $1, otp_expires_at = $2 WHERE id = $3 RETURNING id';
    const result = await db.query(query, [otp, otpExpiresAt, id]);
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
};

const findUserById = async (id) => {
    const query = 'SELECT id, full_name, email, role FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    verifyUser,
    updateUserOtp,
};
