const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to allow all files
const fileFilter = (req, file, cb) => {
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file' });
    }

    // Construct public URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/public/uploads/${req.file.filename}`;

    res.status(200).json({
        message: 'File uploaded successfully',
        data: {
            url: fileUrl,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname,
            size: req.file.size
        }
    });
};

module.exports = {
    upload,
    uploadFile
};
