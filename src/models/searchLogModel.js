const db = require('../config/db');

// Create search log entry
const createSearchLog = async (userId, licensePlate, countryIso, makeId = null, modelId = null, vehicleType = null, colorId = null, typeMatchId = 1) => {
    const query = `
        INSERT INTO "VehicleSearchHistory" ("UserId", "LicensePlate", "CountryIso", "MakeId", "ModelId", "VehicleType", "ColorId", "TypeMatchId")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const values = [userId, licensePlate, countryIso, makeId, modelId, vehicleType, colorId, typeMatchId];
    const result = await db.query(query, values);
    return result.rows[0];
};

// Get all search logs with pagination and filters
const getAllSearchLogs = async (filters = {}) => {
    const { page = 1, limit = 10, userId, startDate, endDate, query: searchQuery } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (userId) {
        whereConditions.push(`vsh."UserId" = $${paramCount}`);
        params.push(userId);
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

    if (searchQuery) {
        whereConditions.push(`vsh."LicensePlate" ILIKE $${paramCount}`);
        params.push(`%${searchQuery}%`);
        paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
        SELECT 
            vsh."Id",
            vsh."UserId",
            u."DisplayName" as "UserName",
            u."Email" as "UserEmail",
            vsh."LicensePlate" as "SearchQuery",
            vsh."CountryIso",
            vsh."CreatedAtUTC",
            m."Name" as "MakeName",
            mod."Name" as "ModelName"
        FROM "VehicleSearchHistory" vsh
        LEFT JOIN "User" u ON vsh."UserId" = u."Id"
        LEFT JOIN "Make" m ON vsh."MakeId" = m."Id"
        LEFT JOIN "Model" mod ON vsh."ModelId" = mod."Id"
        ${whereClause}
        ORDER BY vsh."CreatedAtUTC" DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);
    const result = await db.query(query, params);

    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total
        FROM "VehicleSearchHistory" vsh
        ${whereClause}
    `;
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const totalRecords = parseInt(countResult.rows[0].total);

    return {
        logs: result.rows,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit),
            totalRecords,
            limit
        }
    };
};

// Get single search log by ID
const getSearchLogById = async (id) => {
    const query = `
        SELECT 
            vsh."Id",
            vsh."UserId",
            u."DisplayName" as "UserName",
            u."Email" as "UserEmail",
            vsh."LicensePlate" as "SearchQuery",
            vsh."CountryIso",
            u."CountryName",
            vsh."CreatedAtUTC",
            m."Name" as "MakeName",
            mod."Name" as "ModelName",
            vsh."VehicleType"
        FROM "VehicleSearchHistory" vsh
        LEFT JOIN "User" u ON vsh."UserId" = u."Id"
        LEFT JOIN "Make" m ON vsh."MakeId" = m."Id"
        LEFT JOIN "Model" mod ON vsh."ModelId" = mod."Id"
        WHERE vsh."Id" = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

// Delete search log
const deleteSearchLog = async (id) => {
    const query = 'DELETE FROM "VehicleSearchHistory" WHERE "Id" = $1 RETURNING "Id"';
    const result = await db.query(query, [id]);
    return result.rows[0];
};

// Get search statistics
const getSearchStats = async (filters = {}) => {
    const { startDate, endDate } = filters;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (startDate) {
        whereConditions.push(`"CreatedAtUTC" >= $${paramCount}`);
        params.push(startDate);
        paramCount++;
    }

    if (endDate) {
        whereConditions.push(`"CreatedAtUTC" <= $${paramCount}`);
        params.push(endDate);
        paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total searches
    const totalQuery = `SELECT COUNT(*) as total FROM "VehicleSearchHistory" ${whereClause}`;
    const totalResult = await db.query(totalQuery, params);
    const totalSearches = parseInt(totalResult.rows[0].total);

    // Unique users
    const uniqueUsersQuery = `SELECT COUNT(DISTINCT "UserId") as total FROM "VehicleSearchHistory" ${whereClause}`;
    const uniqueUsersResult = await db.query(uniqueUsersQuery, params);
    const uniqueUsers = parseInt(uniqueUsersResult.rows[0].total);

    // Top search queries
    const topQueriesQuery = `
        SELECT "LicensePlate" as query, COUNT(*) as count
        FROM "VehicleSearchHistory"
        ${whereClause}
        GROUP BY "LicensePlate"
        ORDER BY count DESC
        LIMIT 10
    `;
    const topQueriesResult = await db.query(topQueriesQuery, params);

    // Searches by country
    const byCountryQuery = `
        SELECT vsh."CountryIso" as "countryIso", u."CountryName" as "countryName", COUNT(*) as count
        FROM "VehicleSearchHistory" vsh
        LEFT JOIN "User" u ON vsh."UserId" = u."Id"
        ${whereClause}
        GROUP BY vsh."CountryIso", u."CountryName"
        ORDER BY count DESC
    `;
    const byCountryResult = await db.query(byCountryQuery, params);

    // Searches by date
    const byDateQuery = `
        SELECT DATE("CreatedAtUTC") as date, COUNT(*) as count
        FROM "VehicleSearchHistory"
        ${whereClause}
        GROUP BY DATE("CreatedAtUTC")
        ORDER BY date DESC
        LIMIT 30
    `;
    const byDateResult = await db.query(byDateQuery, params);

    return {
        totalSearches,
        uniqueUsers,
        averageResultsPerSearch: totalSearches > 0 ? (totalSearches / uniqueUsers).toFixed(2) : 0,
        topSearchQueries: topQueriesResult.rows,
        searchesByCountry: byCountryResult.rows,
        searchesByDate: byDateResult.rows
    };
};

module.exports = {
    createSearchLog,
    getAllSearchLogs,
    getSearchLogById,
    deleteSearchLog,
    getSearchStats
};
