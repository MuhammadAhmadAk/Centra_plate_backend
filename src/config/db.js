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

// Run this ONLY if you checking connection, DO NOT wipe DB every time
async function bootstrapDatabase() {
    try {
        const client = await pool.connect();

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
            console.log('Database schema initialized successfully.');
        } else {
            console.log('Database tables already exist. Skipping initialization.');
        }

        client.release();
        console.log('PostgreSQL Database connected.');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    bootstrapDatabase
};
