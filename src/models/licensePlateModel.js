const db = require('../config/db');

const createLicensePlate = async (userId, plateNumber) => {
    const query = `
    INSERT INTO license_plates (user_id, plate_number)
    VALUES ($1, $2)
    RETURNING *;
  `;
    const values = [userId, plateNumber];
    const result = await db.query(query, values);
    return result.rows[0];
};

const findLicensePlateByNumber = async (plateNumber) => {
    const query = 'SELECT * FROM license_plates WHERE plate_number = $1';
    const result = await db.query(query, [plateNumber]);
    return result.rows[0];
};

const findLicensePlateByUserId = async (userId) => {
    const query = 'SELECT * FROM license_plates WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0];
};

const getAllLicensePlates = async () => {
    const query = `
        SELECT lp.id, lp.plate_number, lp.created_at,
               u.id as user_id, u.full_name, u.email, u.role, u.is_verified
        FROM license_plates lp
        JOIN users u ON lp.user_id = u.id
    `;
    const result = await db.query(query);
    return result.rows;
};

module.exports = {
    createLicensePlate,
    findLicensePlateByNumber,
    findLicensePlateByUserId,
    getAllLicensePlates,
};
