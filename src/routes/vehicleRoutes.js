const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Public Data Routes (Lookup)
router.get('/makes', vehicleController.getMakes);
router.get('/models', vehicleController.getModels); // ?makeId=1

// Protected routes
router.post('/add', authenticateToken, vehicleController.addVehicle);
router.get('/my-vehicles', authenticateToken, vehicleController.getMyVehicles);

// Public or Protected
router.get('/search/:plateNumber', authenticateToken, vehicleController.searchPlate);

// Public route to get all
router.get('/all', vehicleController.getAllVehicles);

module.exports = router;
