const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Route for file upload
// Expects form-data with key 'file'
router.post('/', uploadController.upload.single('file'), uploadController.uploadFile);

module.exports = router;
