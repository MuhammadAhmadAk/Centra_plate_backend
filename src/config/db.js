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

// Postgres usually connects to a DB immediately, so "bootstrap" here just means running schema
async function bootstrapDatabase() {
    try {
        const client = await pool.connect();
        // console.log('Connected to PostgreSQL database');

        // Read and Execute Schema
        const schemaPath = path.join(__dirname, '../../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // PG can execute multiple statements in one call
        await client.query(schemaSql);
        // console.log('Schema initialized.');

        client.release();
        console.log('PostgreSQL Database ready.');
    } catch (err) {
        console.error('Database connection/initialization failed:', err);
        process.exit(1);
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    bootstrapDatabase
};
