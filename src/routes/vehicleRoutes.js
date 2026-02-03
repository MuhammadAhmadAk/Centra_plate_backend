const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Public Data Routes (Lookup)
router.get('/makes', vehicleController.getMakes);
// router.get('/models', vehicleController.getModels); // ?makeId=1 - commented out: models now returned with /makes

// Protected routes
router.post('/add', authenticateToken, vehicleController.addVehicle);
router.get('/my-vehicles', authenticateToken, vehicleController.getMyVehicles);

// Admin Routes (Make/Model Management)
router.post('/makes', authenticateToken, requireAdmin, vehicleController.addMake);
router.put('/makes/:id', authenticateToken, requireAdmin, vehicleController.updateMake);
router.delete('/makes/:id', authenticateToken, requireAdmin, vehicleController.deleteMake);

router.post('/models', authenticateToken, requireAdmin, vehicleController.addModel);
router.put('/models/:id', authenticateToken, requireAdmin, vehicleController.updateModel);
router.delete('/models/:id', authenticateToken, requireAdmin, vehicleController.deleteModel);

// Public or Protected
router.get('/search/:plateNumber', authenticateToken, vehicleController.searchPlate);

// Public route to get all
// router.get('/all', vehicleController.getAllVehicles); // commented out: heavy/duplicate endpoint

module.exports = router;
