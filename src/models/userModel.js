const db = require('../config/db');

// Create user
const createUser = async (displayName, email, passwordHash, userTypeId, language, countryIso, countryName) => {
    const query = `
    INSERT INTO "User" ("DisplayName", "Email", "PasswordHash", "UserTypeId", "Language", "CountryIso", "CountryName")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING "Id", "DisplayName", "Email", "UserTypeId", "CreatedAtUTC";
  `;
    const values = [displayName, email, passwordHash, userTypeId, language, countryIso, countryName];
    const result = await db.query(query, values);
    return result.rows[0];
};

// Find by email
const findUserByEmail = async (email) => {
    const query = `
        SELECT u.*, ut."Type" as "Role" 
        FROM "User" u 
        LEFT JOIN "UserType" ut ON u."UserTypeId" = ut."Id" 
        WHERE "Email" = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];
};

// Find by ID
const findUserById = async (id) => {
    const query = `
        SELECT u."Id", u."DisplayName", u."Email", u."UserTypeId", ut."Type" as "Role", u."CountryIso", u."CountryName" 
        FROM "User" u
        LEFT JOIN "UserType" ut ON u."UserTypeId" = ut."Id"
        WHERE u."Id" = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

// Get all users
const findAllUsers = async () => {
    const query = `
        SELECT u."Id", u."DisplayName", u."Email", ut."Type" as "Role", u."CreatedAtUTC", u."CountryIso", u."CountryName",
        EXISTS(SELECT 1 FROM "UserOtpVerification" ov WHERE ov."UserId" = u."Id" AND ov."Redeemed" = TRUE) as "IsVerified"
        FROM "User" u
        LEFT JOIN "UserType" ut ON u."UserTypeId" = ut."Id"
        ORDER BY u."CreatedAtUTC" DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    findAllUsers,
};
