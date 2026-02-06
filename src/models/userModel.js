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
        SELECT u."Id", u."DisplayName", u."Email", u."UserTypeId", ut."Type" as "Role", u."CountryIso", u."CountryName", u."ProfilePicURL", u."Bio", u."CreatedAtUTC"
        FROM "User" u
        LEFT JOIN "UserType" ut ON u."UserTypeId" = ut."Id"
        WHERE u."Id" = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

// Update user profile
const updateUser = async (id, data) => {
    let { displayName, bio, profilePicURL, language, countryIso, countryName } = data;

    // Ensure undefined values are passed as null so COALESCE can work
    displayName = displayName === undefined ? null : displayName;
    bio = bio === undefined ? null : bio;
    profilePicURL = profilePicURL === undefined ? null : profilePicURL;
    language = language === undefined ? null : language;
    countryIso = countryIso === undefined ? null : countryIso;
    countryName = countryName === undefined ? null : countryName;

    const query = `
        UPDATE "User"
        SET "DisplayName" = COALESCE($1, "DisplayName"),
            "Bio" = COALESCE($2, "Bio"),
            "ProfilePicURL" = COALESCE($3, "ProfilePicURL"),
            "Language" = COALESCE($4, "Language"),
            "CountryIso" = COALESCE($5, "CountryIso"),
            "CountryName" = COALESCE($6, "CountryName"),
            "ModifiedAtUTC" = (NOW() AT TIME ZONE 'UTC')
        WHERE "Id" = $7
        RETURNING "Id", "DisplayName", "Email", "UserTypeId", "Language", "CountryIso", "CountryName", "ProfilePicURL", "Bio", "CreatedAtUTC";
    `;
    const values = [displayName, bio, profilePicURL, language, countryIso, countryName, id];
    const result = await db.query(query, values);
    return result.rows[0];
};

// Update user password
const updatePassword = async (id, passwordHash) => {
    const query = `
        UPDATE "User"
        SET "PasswordHash" = $1,
            "ModifiedAtUTC" = (NOW() AT TIME ZONE 'UTC')
        WHERE "Id" = $2
    `;
    await db.query(query, [passwordHash, id]);
};

// Delete user and related data
const deleteUser = async (id) => {
    // 1. Delete user's vehicles (they are SET NULL on delete by default, but user wants them gone)
    await db.query('DELETE FROM "Vehicle" WHERE "UserId" = $1', [id]);

    // 2. Delete the user (other relations like OTP, History, Export use ON DELETE CASCADE)
    const result = await db.query('DELETE FROM "User" WHERE "Id" = $1 RETURNING "Id"', [id]);
    return result.rowCount > 0;
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
    updateUser,
    updatePassword,
    deleteUser,
    findAllUsers,
};
