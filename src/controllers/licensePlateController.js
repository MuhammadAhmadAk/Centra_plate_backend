const licensePlateModel = require('../models/licensePlateModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const assignPlate = async (req, res) => {
    try {
        const { plateNumber } = req.body;
        const userId = req.user.id;

        // Check if user already has a plate
        const existingUserPlate = await licensePlateModel.findLicensePlateByUserId(userId);
        if (existingUserPlate) {
            return sendError(res, 400, 'User already has a license plate assigned');
        }

        // Check if plate is already taken
        const existingPlate = await licensePlateModel.findLicensePlateByNumber(plateNumber);
        if (existingPlate) {
            return sendError(res, 400, 'License plate already taken');
        }

        // Assign plate
        const newPlate = await licensePlateModel.createLicensePlate(userId, plateNumber);
        return sendSuccess(res, 201, 'License plate assigned successfully', newPlate);

    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error during plate assignment', err);
    }
};

const searchPlate = async (req, res) => {
    try {
        const { plateNumber } = req.params;
        const plate = await licensePlateModel.findLicensePlateByNumber(plateNumber);

        if (!plate) {
            return sendError(res, 404, 'License plate not found');
        }

        return sendSuccess(res, 200, 'License plate found', plate);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error during search', err);
    }
};

const getMyPlate = async (req, res) => {
    try {
        const userId = req.user.id;
        const plate = await licensePlateModel.findLicensePlateByUserId(userId);

        if (!plate) {
            return sendError(res, 404, 'No license plate assigned to this user');
        }
        return sendSuccess(res, 200, 'User plate retrieved', plate);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching plate', err);
    }
}

const getAllPlates = async (req, res) => {
    try {
        const plates = await licensePlateModel.getAllLicensePlates();
        // Keep lists under a key for clarity, or if lists are requested flat, it's impossible in JSON object root without a key
        return sendSuccess(res, 200, 'All plates retrieved', { plates });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching all plates', err);
    }
};

module.exports = {
    assignPlate,
    searchPlate,
    getMyPlate,
    getAllPlates
};
