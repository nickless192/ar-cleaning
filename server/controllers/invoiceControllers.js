const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking'); // assuming you already have this

module.exports = {
  // Get all invoices
  async getInvoices(req, res) {
    try {
      const invoices = await Invoice.find({});
      res.json(invoices);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch invoices', details: err.message });
    }
  },

  // Get a single invoice by ID
  async getInvoiceById(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      res.json(invoice);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch invoice', details: err.message });
    }
  },

  // Create invoice (front-end now passes fully built services array)
  async createInvoice(req, res) {
    try {
      const { invoiceNumber, customerName, description, services, bookingId } = req.body;

      if (!Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ error: 'At least one service is required' });
      }

      const totalCost = services.reduce((acc, s) => acc + (s.amount || 0), 0);
      // console.log("Total Cost Calculated:", totalCost);
      console.log("invoice Number:", invoiceNumber);


      const newInvoice = await Invoice.create({
        invoiceNumber,
        customerName,
        description,
        services,
        totalCost,
        bookingId
      });
      // set booking status to 'invoiced' if bookingId is provided
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, { status: 'invoiced' });
      }

      res.status(201).json(newInvoice);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create invoice', details: err.message });
    }
  },

  // Update invoice
  async updateInvoice(req, res) {
    try { 
      //update this function to mark the invoice and booking as paid and update the payment method
      if (req.body.status !== 'paid') {
        return res.status(400).json({ error: 'Only status update to "paid" is allowed' });
      }
      const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, { status: 'paid', payment: { paymentMethod: req.body.paymentMethod, amount: req.body.amount,
        paymentDate: Date.now()

      } }, { new: true });
      if (!updatedInvoice) return res.status(404).json({ error: 'Invoice not found' });

      // Also update the related booking status
      if (updatedInvoice.bookingId) {
        await Booking.findByIdAndUpdate(updatedInvoice.bookingId, { status: 'paid' });
      }

      res.json(updatedInvoice);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update invoice', details: err.message });
    }
  },

  // Delete invoice
  async deleteInvoice(req, res) {
    try {
      const deleted = await Invoice.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Invoice not found' });
      // change the booking status back to 'completed' if it was linked to this invoice
      if (deleted.bookingId) {
        await Booking.findByIdAndUpdate(deleted.bookingId, { status: 'completed' });
      }
      res.json({ message: 'Invoice deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete invoice', details: err.message });
    }
  }
};
