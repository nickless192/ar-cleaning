const router = require('express').Router();
const { createExpense, getExpenses, deleteExpense, bulkInsert, ocrReceipt, bankStatementOCR, updateExpense, parseBankStatementPDF } = require('../../controllers/expensesController');
const upload = require('../../middleware/upload'); // Multer middleware for receipts

router.get('/',
    getExpenses);
router.post('/',
    upload.single('receipt'),
    createExpense);
router.delete('/:id',
    deleteExpense);
router.post('/bulk',
    bulkInsert);
router.put('/:id',
    updateExpense);
router.post('/ocr-receipt', 
    upload.single('receipt'), 
    //  (req, res, next) => {
    // console.log('File received:', req.file);
    // next();
//   },
    ocrReceipt);

    // Bank Statement OCR
router.post('/ocr-bank-statement', 
    upload.single('statement'), // can use 'statement' as the field name
    // bankStatementOCR
    parseBankStatementPDF
);

module.exports = router;
