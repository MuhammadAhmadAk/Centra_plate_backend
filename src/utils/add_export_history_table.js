const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function addExportHistoryTable() {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database.');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS "ExportHistory" (
                "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                "ExportId" VARCHAR(50) UNIQUE NOT NULL,
                "Type" VARCHAR(20) NOT NULL,
                "Format" VARCHAR(10) NOT NULL DEFAULT 'csv',
                "Status" VARCHAR(20) NOT NULL DEFAULT 'completed',
                "RecordCount" INT DEFAULT 0,
                "FileSizeBytes" INT DEFAULT 0,
                "FileName" VARCHAR(255),
                "ErrorMessage" TEXT,
                "CreatedByUserId" INT NOT NULL,
                "CreatedAtUTC" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
                "ExpiresAtUTC" TIMESTAMP,
                
                CONSTRAINT "FK_Export_User" FOREIGN KEY ("CreatedByUserId") REFERENCES "User"("Id") ON DELETE CASCADE
            );
        `;

        await client.query(createTableQuery);
        console.log('✅ ExportHistory table created successfully.');

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating ExportHistory table:', err);
        process.exit(1);
    }
}

addExportHistoryTable();
