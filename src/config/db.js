const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log(`Connecting to DB. SSL forced to: FALSE`);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false, // Temporarily disabled for troubleshooting
    connectionTimeoutMillis: 15000,
});

// Run this ONLY if you checking connection, DO NOT wipe DB every time
async function bootstrapDatabase() {
    console.log("Database connection string present:", !!process.env.DATABASE_URL);
    try {
        const client = await pool.connect();
        console.log('Successfully connected to Postgres client.');

        // Check if tables exist by looking for the 'User' table
        const checkTableQuery = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'User'
            );
        `;
        const res = await client.query(checkTableQuery);
        const tableExists = res.rows[0].exists;

        if (!tableExists) {
            console.log('Tables not found. Initializing database schema...');
            const schemaPath = path.join(__dirname, '../../schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await client.query(schemaSql);
            console.log('Database schema initialized.');
        }

        client.release();
        return true;
    } catch (err) {
        console.error('--- DATABASE CONNECTION ERROR ---');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        if (err.code === 'ETIMEOUT' || err.code === 'ECONNREFUSED') {
            console.error('Hint: Is your VPS firewall blocking port 5432?');
        }
        throw err;
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    bootstrapDatabase
};
