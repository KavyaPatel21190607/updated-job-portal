const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Configure storage for uploaded files
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${req.user?.id || 'user'}_${uniqueSuffix}_${name}${ext}`);
  },
});

/**
 * File filter for validation
 */
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    resume: ['.pdf', '.doc', '.docx'],
    image: ['.jpg', '.jpeg', '.png', '.gif'],
  };

  const ext = path.extname(file.originalname).toLowerCase();

  // Check file type based on field name
  if (file.fieldname === 'resume') {
    if (allowedTypes.resume.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error('Only PDF and Word documents are allowed for resumes'), false);
  }

  if (file.fieldname === 'profilePicture' || file.fieldname === 'companyLogo') {
    if (allowedTypes.image.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error('Only image files (JPG, PNG, GIF) are allowed'), false);
  }

  cb(null, true);
};

/**
 * Configure multer upload
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Delete file from uploads directory
 */
const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

module.exports = {
  upload,
  deleteFile,
};
