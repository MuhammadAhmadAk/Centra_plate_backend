const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.get('/all-users', authenticateToken, requireAdmin, authController.getAllUsers);

module.exports = router;
