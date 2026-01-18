const express = require('express');
const router = express.Router();
const searchLogController = require('../controllers/searchLogController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// All routes require admin access
router.get('/search', authenticateToken, requireAdmin, searchLogController.getAllSearchLogs);
router.get('/search/:id', authenticateToken, requireAdmin, searchLogController.getSearchLogById);
router.delete('/search/:id', authenticateToken, requireAdmin, searchLogController.deleteSearchLog);
router.get('/stats', authenticateToken, requireAdmin, searchLogController.getSearchStats);

module.exports = router;
