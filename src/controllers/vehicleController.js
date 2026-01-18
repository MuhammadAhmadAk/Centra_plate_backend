const vehicleModel = require('../models/vehicleModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const addVehicle = async (req, res) => {
    try {
        const { licensePlate, countryIso, vehicleType, makeId, modelId } = req.body;
        const userId = req.user.id;

        if (!licensePlate || !countryIso) {
            return sendError(res, 400, 'License Plate and Country ISO code are required');
        }

        try {
            const newVehicle = await vehicleModel.createVehicle(userId, licensePlate, countryIso, vehicleType, makeId, modelId);
            return sendSuccess(res, 201, 'Vehicle added successfully', newVehicle);
        } catch (dbErr) {
            if (dbErr.code === '23505') {
                return sendError(res, 400, 'This license plate is already registered in this country');
            }
            throw dbErr;
        }

    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error adding vehicle', err);
    }
};

const searchPlate = async (req, res) => {
    try {
        const { plateNumber } = req.params;
        const vehicle = await vehicleModel.findVehicleByPlate(plateNumber);

        if (!vehicle) {
            return sendError(res, 404, 'Vehicle not found');
        }

        return sendSuccess(res, 200, 'Vehicle found', vehicle);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error during search', err);
    }
};

const getMyVehicles = async (req, res) => {
    try {
        const userId = req.user.id;
        const vehicles = await vehicleModel.findVehiclesByUserId(userId);
        // Always return success even if empty array, easier for frontend
        return sendSuccess(res, 200, 'User vehicles retrieved', vehicles || []);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching vehicles', err);
    }
}

const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await vehicleModel.getAllVehicles();
        return sendSuccess(res, 200, 'All vehicles retrieved', { vehicles });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching all vehicles', err);
    }
};

// --- New Controllers ---

const getMakes = async (req, res) => {
    try {
        const makes = await vehicleModel.getAllMakes();
        return sendSuccess(res, 200, 'Makes retrieved successfully', makes);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching makes', err);
    }
};

const getModels = async (req, res) => {
    try {
        const { makeId } = req.query;
        if (!makeId) {
            return sendError(res, 400, 'makeId query parameter is required');
        }
        const models = await vehicleModel.getModelsByMakeId(makeId);
        return sendSuccess(res, 200, 'Models retrieved successfully', models);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching models', err);
    }
};

module.exports = {
    addVehicle,
    searchPlate,
    getMyVehicles,
    getAllVehicles,
    getMakes,
    getModels
};
