const db = require('../config/db');
require('dotenv').config();

async function checkMessages() {
    try {
        await db.bootstrapDatabase();

        console.log("Checking messages in database...");
        const messages = await db.query('SELECT * FROM messages ORDER BY created_at DESC');

        console.log(`Total Messages found: ${messages.length}`);
        console.table(messages);

        process.exit(0);
    } catch (err) {
        console.error('Error reading messages:', err);
        process.exit(1);
    }
}

checkMessages();
