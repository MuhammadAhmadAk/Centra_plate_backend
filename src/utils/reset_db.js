const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function resetDatabase() {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database. Resetting Schema...');

        const schemaPath = path.join(__dirname, '../../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schemaSql);
        console.log('Schema reset successfully.');

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Database reset failed:', err);
        process.exit(1);
    }
}

resetDatabase();
