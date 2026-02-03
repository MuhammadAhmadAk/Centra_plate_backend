const db = require('../config/db');

// Shared SQL Fragments for consistency
const MAKE_JSON_SQL = `CASE WHEN m."Id" IS NOT NULL THEN json_build_object('Id', m."Id", 'Name', m."Name") ELSE NULL END`;
const MODEL_JSON_SQL = `CASE WHEN mod."Id" IS NOT NULL THEN json_build_object('Id', mod."Id", 'Name', mod."Name") ELSE NULL END`;

// Create Vehicle
const createVehicle = async (userId, licensePlate, countryIso, vehicleType = null, makeId = null, modelId = null) => {
        // Normalize license plate to meet DB check constraint (uppercase, trimmed)
        const normalizedPlate = licensePlate && typeof licensePlate === 'string'
                ? licensePlate.trim().toUpperCase()
                : licensePlate;

        const query = `
        INSERT INTO "Vehicle" ("UserId", "LicensePlate", "CountryIso", "VehicleType", "MakeId", "ModelId")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
        const values = [userId, normalizedPlate, countryIso, vehicleType, makeId, modelId];
        const result = await db.query(query, values);
        return result.rows[0];
};

// Find by Plate
const findVehicleByPlate = async (licensePlate) => {
    const query = `
        SELECT v."Id", v."UserId", v."LicensePlate", v."CountryIso",
        json_build_object(
            'VehicleType', v."VehicleType",
            'Make', ${MAKE_JSON_SQL},
            'Model', ${MODEL_JSON_SQL}
        ) as "Details",
        v."CreatedAtUTC", v."ModifiedAtUTC"
        FROM "Vehicle" v
        LEFT JOIN "Make" m ON v."MakeId" = m."Id"
        LEFT JOIN "Model" mod ON v."ModelId" = mod."Id"
        WHERE v."LicensePlate" = $1
    `;
    const result = await db.query(query, [licensePlate]);
    return result.rows[0];
};

// Find by User
const findVehiclesByUserId = async (userId) => {
    const query = `
        SELECT v."Id", v."UserId", v."LicensePlate", v."CountryIso",
        json_build_object(
            'VehicleType', v."VehicleType",
            'Make', ${MAKE_JSON_SQL},
            'Model', ${MODEL_JSON_SQL}
        ) as "Details",
        v."CreatedAtUTC", v."ModifiedAtUTC"
        FROM "Vehicle" v
        LEFT JOIN "Make" m ON v."MakeId" = m."Id"
        LEFT JOIN "Model" mod ON v."ModelId" = mod."Id"
        WHERE v."UserId" = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

const getAllVehicles = async () => {
    const query = `
        SELECT v."Id", v."UserId", v."LicensePlate", v."CountryIso",
        json_build_object(
            'VehicleType', v."VehicleType",
            'Make', ${MAKE_JSON_SQL},
            'Model', ${MODEL_JSON_SQL}
        ) as "Details",
        v."CreatedAtUTC", v."ModifiedAtUTC", u."DisplayName", u."Email"
        FROM "Vehicle" v
        LEFT JOIN "User" u ON v."UserId" = u."Id"
        LEFT JOIN "Make" m ON v."MakeId" = m."Id"
        LEFT JOIN "Model" mod ON v."ModelId" = mod."Id"
    `;
    const result = await db.query(query);
    return result.rows;
};

// --- New Lookup Methods ---

const getAllMakes = async () => {
    const query = 'SELECT "Id", "Name" FROM "Make" ORDER BY "Name" ASC';
    const result = await db.query(query);
    return result.rows;
};

const getMakeById = async (makeId) => {
    const query = 'SELECT "Id", "Name" FROM "Make" WHERE "Id" = $1';
    const result = await db.query(query, [makeId]);
    return result.rows[0];
};

const getModelsByMakeId = async (makeId) => {
    const query = 'SELECT "Id", "Name" FROM "Model" WHERE "MakeId" = $1 ORDER BY "Name" ASC';
    const result = await db.query(query, [makeId]);
    return result.rows;
};

const getModelById = async (modelId) => {
    const query = 'SELECT "Id", "Name", "MakeId", "VehicleType" FROM "Model" WHERE "Id" = $1';
    const result = await db.query(query, [modelId]);
    return result.rows[0];
};

// --- Make Management ---

const createMake = async (name) => {
    const query = 'INSERT INTO "Make" ("Name") VALUES ($1) RETURNING "Id", "Name"';
    const result = await db.query(query, [name]);
    return result.rows[0];
};

const updateMake = async (id, name) => {
    const query = 'UPDATE "Make" SET "Name" = $1 WHERE "Id" = $2 RETURNING "Id", "Name"';
    const result = await db.query(query, [name, id]);
    return result.rows[0];
};

const deleteMake = async (id) => {
    const query = 'DELETE FROM "Make" WHERE "Id" = $1 RETURNING "Id"';
    const result = await db.query(query, [id]);
    return result.rows[0];
};

// --- Model Management ---

const createModel = async (makeId, name, vehicleType = 'Car') => {
    const query = 'INSERT INTO "Model" ("MakeId", "Name", "VehicleType") VALUES ($1, $2, $3) RETURNING "Id", "Name", "MakeId", "VehicleType"';
    const result = await db.query(query, [makeId, name, vehicleType]);
    return result.rows[0];
};

const updateModel = async (id, name, vehicleType) => {
    let query = 'UPDATE "Model" SET "Name" = $1';
    const params = [name];
    let paramCount = 2;

    if (vehicleType) {
        query += `, "VehicleType" = $${paramCount}`;
        params.push(vehicleType);
        paramCount++;
    }

    query += ` WHERE "Id" = $${paramCount} RETURNING "Id", "Name", "MakeId", "VehicleType"`;
    params.push(id);

    const result = await db.query(query, params);
    return result.rows[0];
};

const deleteModel = async (id) => {
    const query = 'DELETE FROM "Model" WHERE "Id" = $1 RETURNING "Id"';
    const result = await db.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    createVehicle,
    findVehicleByPlate,
    findVehiclesByUserId,
    getAllVehicles,
    getAllMakes,
    getMakeById,
    getModelsByMakeId,
        getModelById,
    createMake,
    updateMake,
    deleteMake,
    createModel,
    updateModel,
    deleteModel
};
