import multer from 'multer';
import fs from 'fs';

// Define upload directory
const uploadPath = 'uploads/';
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export { upload };
