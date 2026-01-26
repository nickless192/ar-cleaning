const router = require('express').Router();
const { getInvoices, getInvoiceById, createInvoice, updateInvoice, deleteInvoice,
    getInvoiceByBooking,
    getInvoicePdf,
    sendInvoice
 } = require('../../controllers/invoiceControllers');

// POST /invoices
router.post('/', createInvoice); // Create a new invoice

// GET /invoices
router.get('/', getInvoices);

// GET /invoices/:id
router.get('/:id', getInvoiceById);

// PUT /invoices/:id
router.put('/:id', updateInvoice);

// DELETE /invoices/:id
router.delete('/:id', deleteInvoice);
module.exports = router;

///by-booking/:bookingId
router.get('/by-booking/:bookingId', getInvoiceByBooking);
router.get("/:id/pdf", getInvoicePdf);
router.post("/:id/send", sendInvoice);