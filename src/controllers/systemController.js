const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const seedAdmin = require('../utils/seedAdmin');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const resetDatabase = async (req, res) => {
    try {
        const schemaPath = path.join(__dirname, '../../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema to wipe and recreate tables
        // Note: This relies on the SQL file containing DROP statements or RECREATE logic
        await db.query(schemaSql);

        // Re-seed admin user as the table is likely wiped
        await seedAdmin();

        return sendSuccess(res, 200, 'Database reset successfully. Schema reapplied and Admin user restored.');
    } catch (err) {
        console.error('Database reset error:', err);
        return sendError(res, 500, 'Failed to reset database', err);
    }
};

module.exports = {
    resetDatabase
};
