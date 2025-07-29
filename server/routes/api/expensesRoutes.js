const router = require('express').Router();
const { createExpense, getExpenses, deleteExpense, bulkInsert, ocrReceipt } = require('../../controllers/expensesController');
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

router.post('/ocr-receipt', 
    upload.single('receipt'), 
    //  (req, res, next) => {
    // console.log('File received:', req.file);
    // next();
//   },
    ocrReceipt);

module.exports = router;
