const router = require('express').Router();
const { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice,
    getInvoiceByBooking,
    getInvoicePdf,
    sendInvoice
 } = require('../../controllers/invoiceControllers');
 const { adminRouteLimiter, authRouteLimiter } = require('../../middleware/rateLimiters');

// POST /invoices
router.post('/', adminRouteLimiter, createInvoice); // Create a new invoice

// GET /invoices
router.get('/', adminRouteLimiter, getInvoices);

// GET /invoices/:id
router.get('/:id', adminRouteLimiter, getInvoiceById);

// PUT /invoices/:id
router.put('/:id', adminRouteLimiter, updateInvoice);

// DELETE /invoices/:id
router.delete('/:id', adminRouteLimiter, deleteInvoice);
module.exports = router;

///by-booking/:bookingId
router.get('/by-booking/:bookingId', adminRouteLimiter, getInvoiceByBooking);
router.get("/:id/pdf", authRouteLimiter, getInvoicePdf);
router.post("/:id/send", authRouteLimiter,sendInvoice);
