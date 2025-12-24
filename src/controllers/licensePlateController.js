const licensePlateModel = require('../models/licensePlateModel');

const assignPlate = async (req, res) => {
    try {
        const { plateNumber } = req.body;
        const userId = req.user.id;

        // Check if user already has a plate
        const existingUserPlate = await licensePlateModel.findLicensePlateByUserId(userId);
        if (existingUserPlate) {
            return res.status(400).json({ message: 'User already has a license plate assigned' });
        }

        // Check if plate is already taken
        const existingPlate = await licensePlateModel.findLicensePlateByNumber(plateNumber);
        if (existingPlate) {
            return res.status(400).json({ message: 'License plate already taken' });
        }

        // Assign plate
        const newPlate = await licensePlateModel.createLicensePlate(userId, plateNumber);
        res.status(201).json({ message: 'License plate assigned successfully', plate: newPlate });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during plate assignment' });
    }
};

const searchPlate = async (req, res) => {
    try {
        const { plateNumber } = req.params;
        const plate = await licensePlateModel.findLicensePlateByNumber(plateNumber);

        if (!plate) {
            return res.status(404).json({ message: 'License plate not found' });
        }

        res.status(200).json({ plate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during search' });
    }
};

const getMyPlate = async (req, res) => {
    try {
        const userId = req.user.id;
        const plate = await licensePlateModel.findLicensePlateByUserId(userId);

        if (!plate) {
            return res.status(404).json({ message: 'No license plate assigned to this user' });
        }
        res.status(200).json({ plate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching plate' });
    }
}

const getAllPlates = async (req, res) => {
    try {
        const plates = await licensePlateModel.getAllLicensePlates();
        res.status(200).json({ plates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching all plates' });
    }
};

module.exports = {
    assignPlate,
    searchPlate,
    getMyPlate,
    getAllPlates
};
