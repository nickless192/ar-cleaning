const router = require('express').Router();
const {
  createExpense,
  getExpenses,
  deleteExpense,
  bulkInsert,
  ocrReceipt,
  parseBankStatementPDF,
  updateExpense,
  monthlySummary
} = require('../../controllers/expensesController');

const upload = require('../../middleware/upload'); // Multer middleware for receipts

// List (optionally later: ?from&to&method=cash|accrual)
router.get('/', getExpenses);
router.get('/monthly-summary', monthlySummary);

// Create (multipart: supports receipt file)
router.post('/', upload.single('receipt'), createExpense);

// Bulk insert (JSON)
router.post('/bulk', bulkInsert);

// Update
// ✅ allow BOTH:
// - JSON-only updates (no file) -> req.file undefined, controller won't overwrite receipt
// - multipart updates with receipt -> req.file exists
router.put('/:id', upload.single('receipt'), updateExpense);

router.delete('/:id', deleteExpense);

// Receipt OCR
router.post('/ocr-receipt', upload.single('receipt'), ocrReceipt);

// Bank Statement OCR/PDF parse
router.post(
  '/ocr-bank-statement',
  upload.single('statement'),
  parseBankStatementPDF
);

module.exports = router;
