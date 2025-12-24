const db = require('../config/db');

const createMessage = async (senderId, receiverId, content) => {
    const query = `
    INSERT INTO messages (sender_id, receiver_id, content)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
    const values = [senderId, receiverId, content];
    const result = await db.query(query, values);
    return result.rows[0];
};

const getMessagesBetweenUsers = async (user1Id, user2Id) => {
    const query = `
    SELECT * FROM messages
    WHERE (sender_id = $1 AND receiver_id = $2)
       OR (sender_id = $2 AND receiver_id = $1)
    ORDER BY created_at ASC;
  `;
    const values = [user1Id, user2Id];
    const result = await db.query(query, values);
    return result.rows;
};

module.exports = {
    createMessage,
    getMessagesBetweenUsers,
};
