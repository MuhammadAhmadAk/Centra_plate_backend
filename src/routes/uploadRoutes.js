const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Route for image upload
// Expects form-data with key 'image'
router.post('/', uploadController.upload.single('image'), uploadController.uploadImage);

module.exports = router;
