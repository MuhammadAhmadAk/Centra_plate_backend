const vehicleModel = require('../models/vehicleModel');
const searchLogModel = require('../models/searchLogModel');
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
        const userId = req.user.id;

        const vehicle = await vehicleModel.findVehicleByPlate(plateNumber);

        // Log the search (even if not found)
        try {
            await searchLogModel.createSearchLog(
                userId,
                plateNumber,
                vehicle?.CountryIso || 'XX',
                vehicle?.Details?.Make?.Id || null,
                vehicle?.Details?.Model?.Id || null,
                vehicle?.Details?.VehicleType || null,
                null, // colorId
                1 // typeMatchId (Exact)
            );
        } catch (logErr) {
            console.error('Error logging search:', logErr);
            // Don't fail the request if logging fails
        }

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

// --- Make Management ---

const addMake = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return sendError(res, 400, 'Make name is required');

        const newMake = await vehicleModel.createMake(name);
        return sendSuccess(res, 201, 'Make added successfully', newMake);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error adding make', err);
    }
};

const updateMake = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return sendError(res, 400, 'Make name is required');

        const updatedMake = await vehicleModel.updateMake(id, name);
        if (!updatedMake) return sendError(res, 404, 'Make not found');

        return sendSuccess(res, 200, 'Make updated successfully', updatedMake);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error updating make', err);
    }
};

const deleteMake = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMake = await vehicleModel.deleteMake(id);
        if (!deletedMake) return sendError(res, 404, 'Make not found');

        return sendSuccess(res, 200, 'Make deleted successfully', null);
    } catch (err) {
        console.error(err);
        if (err.code === '23503') { // Foreign key violation
            return sendError(res, 400, 'Cannot delete make because it has associated models or vehicles');
        }
        return sendError(res, 500, 'Server error deleting make', err);
    }
};

// --- Model Management ---

const addModel = async (req, res) => {
    try {
        const { makeId, name, vehicleType } = req.body;
        if (!makeId || !name) return sendError(res, 400, 'MakeId and Model name are required');

        const newModel = await vehicleModel.createModel(makeId, name, vehicleType);
        return sendSuccess(res, 201, 'Model added successfully', newModel);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error adding model', err);
    }
};

const updateModel = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, vehicleType } = req.body;

        const updatedModel = await vehicleModel.updateModel(id, name, vehicleType);
        if (!updatedModel) return sendError(res, 404, 'Model not found');

        return sendSuccess(res, 200, 'Model updated successfully', updatedModel);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error updating model', err);
    }
};

const deleteModel = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedModel = await vehicleModel.deleteModel(id);
        if (!deletedModel) return sendError(res, 404, 'Model not found');

        return sendSuccess(res, 200, 'Model deleted successfully', null);
    } catch (err) {
        console.error(err);
        if (err.code === '23503') {
            return sendError(res, 400, 'Cannot delete model because it has associated vehicles');
        }
        return sendError(res, 500, 'Server error deleting model', err);
    }
};

module.exports = {
    addVehicle,
    searchPlate,
    getMyVehicles,
    getAllVehicles,
    getMakes,
    getModels,
    addMake,
    updateMake,
    deleteMake,
    addModel,
    updateModel,
    deleteModel
};
