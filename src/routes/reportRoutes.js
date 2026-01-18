const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// All routes require admin access
router.post('/export/users', authenticateToken, requireAdmin, reportController.exportUsers);
router.post('/export/vehicles', authenticateToken, requireAdmin, reportController.exportVehicles);
router.post('/export/logs', authenticateToken, requireAdmin, reportController.exportSearchLogs);
router.get('/history', authenticateToken, requireAdmin, reportController.getExportHistory);

module.exports = router;
