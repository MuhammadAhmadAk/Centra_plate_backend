const db = require('../config/db');

// Export users data
const exportUsers = async (filters = {}, fields = []) => {
    const { countryIso, status, startDate, endDate } = filters;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (countryIso) {
        whereConditions.push(`u."CountryIso" = $${paramCount}`);
        params.push(countryIso);
        paramCount++;
    }

    if (startDate) {
        whereConditions.push(`u."CreatedAtUTC" >= $${paramCount}`);
        params.push(startDate);
        paramCount++;
    }

    if (endDate) {
        whereConditions.push(`u."CreatedAtUTC" <= $${paramCount}`);
        params.push(endDate);
        paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Always select all fields and let CSV parser filter
    const query = `
        SELECT 
            u."Id",
            u."DisplayName",
            u."Email",
            ut."Type" as "Role",
            u."CountryIso",
            u."CountryName",
            u."CreatedAtUTC",
            EXISTS(SELECT 1 FROM "UserOtpVerification" ov WHERE ov."UserId" = u."Id" AND ov."Redeemed" = TRUE) as "IsVerified"
        FROM "User" u
        LEFT JOIN "UserType" ut ON u."UserTypeId" = ut."Id"
        ${whereClause}
        ORDER BY u."CreatedAtUTC" DESC
    `;

    const result = await db.query(query, params);
    return result.rows;
};

// Export vehicles data
const exportVehicles = async (filters = {}, fields = []) => {
    const { countryIso, makeId, modelId, startDate, endDate } = filters;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (countryIso) {
        whereConditions.push(`v."CountryIso" = $${paramCount}`);
        params.push(countryIso);
        paramCount++;
    }

    if (makeId) {
        whereConditions.push(`v."MakeId" = $${paramCount}`);
        params.push(makeId);
        paramCount++;
    }

    if (modelId) {
        whereConditions.push(`v."ModelId" = $${paramCount}`);
        params.push(modelId);
        paramCount++;
    }

    if (startDate) {
        whereConditions.push(`v."CreatedAtUTC" >= $${paramCount}`);
        params.push(startDate);
        paramCount++;
    }

    if (endDate) {
        whereConditions.push(`v."CreatedAtUTC" <= $${paramCount}`);
        params.push(endDate);
        paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
        SELECT 
            v."Id",
            v."LicensePlate",
            u."DisplayName",
            u."Email",
            m."Name" as "Make",
            mod."Name" as "Model",
            v."VehicleType",
            v."CountryIso",
            v."CreatedAtUTC"
        FROM "Vehicle" v
        LEFT JOIN "User" u ON v."UserId" = u."Id"
        LEFT JOIN "Make" m ON v."MakeId" = m."Id"
        LEFT JOIN "Model" mod ON v."ModelId" = mod."Id"
        ${whereClause}
        ORDER BY v."CreatedAtUTC" DESC
    `;

    const result = await db.query(query, params);
    return result.rows;
};

// Export search logs data
const exportSearchLogs = async (filters = {}, fields = []) => {
    const { userId, countryIso, startDate, endDate } = filters;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (userId) {
        whereConditions.push(`vsh."UserId" = $${paramCount}`);
        params.push(userId);
        paramCount++;
    }

    if (countryIso) {
        whereConditions.push(`vsh."CountryIso" = $${paramCount}`);
        params.push(countryIso);
        paramCount++;
    }

    if (startDate) {
        whereConditions.push(`vsh."CreatedAtUTC" >= $${paramCount}`);
        params.push(startDate);
        paramCount++;
    }

    if (endDate) {
        whereConditions.push(`vsh."CreatedAtUTC" <= $${paramCount}`);
        params.push(endDate);
        paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
        SELECT 
            vsh."Id",
            u."DisplayName" as "UserName",
            u."Email" as "UserEmail",
            vsh."LicensePlate" as "SearchQuery",
            vsh."CountryIso",
            vsh."CreatedAtUTC"
        FROM "VehicleSearchHistory" vsh
        LEFT JOIN "User" u ON vsh."UserId" = u."Id"
        ${whereClause}
        ORDER BY vsh."CreatedAtUTC" DESC
    `;

    const result = await db.query(query, params);
    return result.rows;
};

module.exports = {
    exportUsers,
    exportVehicles,
    exportSearchLogs
};
