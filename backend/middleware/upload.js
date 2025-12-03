/**
 * File Upload Middleware
 * Configures multer for handling multipart/form-data
 */

const multer = require('multer');

// Configure multer to use memory storage
// Files will be available as buffer in req.files
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10 // Max 10 files per request
  },
  fileFilter: fileFilter
});

module.exports = upload;
