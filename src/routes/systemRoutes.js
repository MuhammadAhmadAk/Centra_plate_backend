const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

// WARNING: This endpoint wipes the database. Use with caution.
router.post('/reset-db', systemController.resetDatabase);

module.exports = router;
