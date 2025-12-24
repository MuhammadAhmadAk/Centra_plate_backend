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

module.exports = {
    createLicensePlate,
    findLicensePlateByNumber,
    findLicensePlateByUserId,
};
