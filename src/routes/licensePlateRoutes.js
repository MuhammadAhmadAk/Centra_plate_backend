const express = require('express');
const router = express.Router();
const licensePlateController = require('../controllers/licensePlateController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Protected routes
router.post('/assign', authenticateToken, licensePlateController.assignPlate);
router.get('/my-plate', authenticateToken, licensePlateController.getMyPlate);

// Public or Protected? detailed info usually protected, basic discovery might be public.
// Project says: "Be discoverable by other users via that license plate"
// I'll make it protected so you need to be logged in to search.
router.get('/search/:plateNumber', authenticateToken, licensePlateController.searchPlate);

// Public route to get all plates
router.get('/all', licensePlateController.getAllPlates);

module.exports = router;
