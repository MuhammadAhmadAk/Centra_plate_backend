const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const uploadController = require('../controllers/uploadController');

const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.get('/all-users', authenticateToken, requireAdmin, authController.getAllUsers);

// Profile routes
router.get('/get-profile', authenticateToken, authController.getProfile);
router.put('/update-profile', authenticateToken, authController.updateProfile);
router.post('/change-password', authenticateToken, authController.changePassword);
router.delete('/delete-account', authenticateToken, authController.deleteAccount);

module.exports = router;
