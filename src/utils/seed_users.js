const db = require('../config/db');
require('dotenv').config();

async function seedUsers() {
    try {
        // Ensure connection is established (PG pool handles this, but good to trigger)
        // db.bootstrapDatabase is for schema creation, we assume schema exists or we run it manually.
        // Let's rely on the fact that the app is running so schema might be there, 
        // OR we can explicitly call bootstrapDatabase inside server.js on start.
        // But for this script, let's just insert data.

        console.log("Seeding test users into PostgreSQL...");

        // Insert User 1
        await db.query(`
            INSERT INTO users (id, full_name, email, password_hash, role) 
            VALUES (1, 'Test User 1', 'user1@example.com', 'dummyhash123', 'user')
            ON CONFLICT (id) DO NOTHING;
        `);
        console.log("✅ User 1 Verified");

        // Insert User 2
        await db.query(`
            INSERT INTO users (id, full_name, email, password_hash, role) 
            VALUES (2, 'Test User 2', 'user2@example.com', 'dummyhash123', 'user')
            ON CONFLICT (id) DO NOTHING;
        `);
        console.log("✅ User 2 Verified");

        // Insert License Plate
        await db.query(`
            INSERT INTO license_plates (user_id, plate_number)
            VALUES (1, 'ABC-123')
            ON CONFLICT (plate_number) DO NOTHING;
        `);
        console.log("✅ Plate 'ABC-123' Verified for User 1");

        console.log("\nDone! Database is ready for testing.");
        process.exit(0);

    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedUsers();
