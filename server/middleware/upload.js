const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base uploads directory
const baseUploadDir = path.join(__dirname, '..', 'uploads');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // receipt => uploads/receipts
    // statement => uploads/bank-statements
    const subdir = file.fieldname === 'statement' ? 'bank-statements' : 'receipts';
    const dir = path.join(baseUploadDir, subdir);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only images and PDFs are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // bump to 10MB; statements can be bigger
});

module.exports = upload;
