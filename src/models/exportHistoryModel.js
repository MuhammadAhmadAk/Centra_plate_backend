const db = require('../config/db');

// Create export history record
const createExportHistory = async (exportData) => {
    const { exportId, type, format, recordCount, fileSizeBytes, fileName, createdByUserId, expiresAtUTC } = exportData;

    const query = `
        INSERT INTO "ExportHistory" ("ExportId", "Type", "Format", "RecordCount", "FileSizeBytes", "FileName", "CreatedByUserId", "ExpiresAtUTC")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;

    const values = [exportId, type, format, recordCount, fileSizeBytes, fileName, createdByUserId, expiresAtUTC];
    const result = await db.query(query, values);
    return result.rows[0];
};

// Get export history with pagination and filters
const getExportHistory = async (filters = {}) => {
    const { page = 1, limit = 10, type, status, userId } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    if (type) {
        whereConditions.push(`eh."Type" = $${paramCount}`);
        params.push(type);
        paramCount++;
    }

    if (status) {
        whereConditions.push(`eh."Status" = $${paramCount}`);
        params.push(status);
        paramCount++;
    }

    if (userId) {
        whereConditions.push(`eh."CreatedByUserId" = $${paramCount}`);
        params.push(userId);
        paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
        SELECT 
            eh."Id",
            eh."ExportId",
            eh."Type",
            eh."Format",
            eh."Status",
            eh."RecordCount",
            eh."FileSizeBytes",
            eh."FileName",
            eh."ErrorMessage",
            eh."CreatedAtUTC",
            eh."ExpiresAtUTC",
            u."Id" as "CreatedById",
            u."DisplayName" as "CreatedByName",
            u."Email" as "CreatedByEmail",
            CASE 
                WHEN eh."ExpiresAtUTC" IS NOT NULL AND eh."ExpiresAtUTC" < NOW() AT TIME ZONE 'UTC' 
                THEN true 
                ELSE false 
            END as "IsExpired"
        FROM "ExportHistory" eh
        LEFT JOIN "User" u ON eh."CreatedByUserId" = u."Id"
        ${whereClause}
        ORDER BY eh."CreatedAtUTC" DESC
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);
    const result = await db.query(query, params);

    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total
        FROM "ExportHistory" eh
        ${whereClause}
    `;
    const countResult = await db.query(countQuery, params.slice(0, -2));
    const totalRecords = parseInt(countResult.rows[0].total);

    // Get summary stats
    const summaryQuery = `
        SELECT 
            COUNT(*) as "totalExports",
            SUM(CASE WHEN "Status" = 'completed' THEN 1 ELSE 0 END) as "completedExports",
            SUM(CASE WHEN "ExpiresAtUTC" < NOW() AT TIME ZONE 'UTC' THEN 1 ELSE 0 END) as "expiredExports",
            SUM(CASE WHEN "Status" = 'failed' THEN 1 ELSE 0 END) as "failedExports"
        FROM "ExportHistory"
        ${whereClause}
    `;
    const summaryResult = await db.query(summaryQuery, params.slice(0, -2));

    return {
        exports: result.rows,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit),
            totalRecords,
            limit,
            hasNextPage: page < Math.ceil(totalRecords / limit),
            hasPreviousPage: page > 1
        },
        summary: {
            totalExports: parseInt(summaryResult.rows[0].totalExports) || 0,
            completedExports: parseInt(summaryResult.rows[0].completedExports) || 0,
            expiredExports: parseInt(summaryResult.rows[0].expiredExports) || 0,
            failedExports: parseInt(summaryResult.rows[0].failedExports) || 0
        }
    };
};

// Get single export by ID
const getExportById = async (exportId) => {
    const query = `
        SELECT 
            eh.*,
            u."Id" as "CreatedById",
            u."DisplayName" as "CreatedByName",
            u."Email" as "CreatedByEmail"
        FROM "ExportHistory" eh
        LEFT JOIN "User" u ON eh."CreatedByUserId" = u."Id"
        WHERE eh."ExportId" = $1
    `;
    const result = await db.query(query, [exportId]);
    return result.rows[0];
};

// Update export status
const updateExportStatus = async (exportId, status, errorMessage = null) => {
    const query = `
        UPDATE "ExportHistory"
        SET "Status" = $1, "ErrorMessage" = $2
        WHERE "ExportId" = $3
        RETURNING *;
    `;
    const result = await db.query(query, [status, errorMessage, exportId]);
    return result.rows[0];
};

module.exports = {
    createExportHistory,
    getExportHistory,
    getExportById,
    updateExportStatus
};
