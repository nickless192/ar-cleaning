const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking'); 
const getNextSequence = require("../utils/getNextSequence");

const { generateInvoicePdfBuffer } = require("../utils/invoicePdf");

// ✅ Use YOUR existing email function here (you said this part is done)
// Update this import to your real module path/name.
const { sendInvoiceEmail } = require("../utils/sendInvoiceEmail");

const COMPANY = {
  name: "CleanAR Solutions",
  line1: "Toronto, ON, Canada",
  email: "info@cleanarsolutions.ca",
  phone: "437-440-5514",
  website: "www.cleanarsolutions.ca",
};

// GET /api/invoices/:id/pdf
async function getInvoicePdf(req, res) {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id).lean();
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const pdfBuffer = await generateInvoicePdfBuffer(invoice, { company: COMPANY });
    const filename = `Invoice-${invoice.invoiceNumber}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    // inline = open in browser, attachment = force download
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (e) {
    console.error("getInvoicePdf error:", e);
    return res.status(500).json({ message: "Failed to generate PDF" });
  }
}

// POST /api/invoices/:id/send
async function sendInvoice(req, res) {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (!invoice.customerEmail) {
      return res.status(400).json({ message: "Invoice has no customerEmail" });
    }

    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePdfBuffer(invoice.toObject(), { company: COMPANY });
    const filename = `Invoice-${invoice.invoiceNumber}.pdf`;

    // Send email (your implementation should support attachments)
    await sendInvoiceEmail({
      to: invoice.customerEmail,
      subject: `CleanAR Solutions Invoice #${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; color:#111;">
          <p>Hello ${invoice.customerName || ""},</p>
               <p>
        Thanks again for choosing <b>CleanAR Solutions</b>!
        Please find the invoice attached${invoice.description ? ` for your ${invoice.description} service` : ""} (total <b>${invoice.totalCost}</b>).
        You can e-transfer to <a href="mailto:info@cleanarsolutions.ca">info@cleanarsolutions.ca</a>.
      </p>

      <p>
        Please don't hesitate to reach out if you have any questions or if there's anything else we can help you with.
      </p>
          <p>Thank you for choosing <b>CleanAR Solutions</b>!</p>
        </div>
      `,
      attachments: [
        {
          filename,
          buffer: pdfBuffer, // Buffer
          contentType: "application/pdf",
        },
      ],
    });

    const now = new Date();

    // If you add these fields to Invoice schema later, set them here:
    // invoice.sentAt = now;
    // invoice.sentTo = invoice.customerEmail;

    await invoice.save();

    // Update booking workflow flags/timestamps for consistency
    if (invoice.bookingId) {
      await Booking.findByIdAndUpdate(invoice.bookingId, {
        invoiceSentAt: now,
        "workflow.invoiceSent": true,
      });
    }

    return res.status(200).json({ message: "Invoice email sent ✅" });
  } catch (e) {
    console.error("sendInvoice error:", e);
    return res.status(500).json({ message: "Failed to send invoice email" });
  }
}

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

  // GET /api/invoices/by-booking/:bookingId
async getInvoiceByBooking(req, res) {
  const { bookingId } = req.params;
  const invoice = await Invoice.findOne({ bookingId }).lean();
  if (!invoice) return res.status(404).json({ message: "No invoice found" });
  res.status(200).json(invoice);
},


  // Create invoice (front-end now passes fully built services array)
  async createInvoice(req, res) {
    try {
      const { customerName, customerEmail, description, services, bookingId } = req.body;

      if (!Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ error: 'At least one service is required' });
      }

      const totalCost = services.reduce((acc, s) => acc + (s.amount || 0), 0);
      // console.log("Total Cost Calculated:", totalCost);
      // console.log("invoice Number:", invoiceNumber);

      // search for existing invoice with same bookingId
      const existingInvoice = await Invoice.findOne({ bookingId });
      if (existingInvoice) {
        return res.status(409).json({ error: 'Invoice already exists for this booking' });
      }
        const INVOICE_START_AT = Number(process.env.INVOICE_START_AT || 1);

    const nextInvoiceNumber = await getNextSequence("invoiceNumber", INVOICE_START_AT);


      const newInvoice = await Invoice.create({
        invoiceNumber: nextInvoiceNumber,
        customerName,
        customerEmail,
        description,
        services,
        totalCost,
        bookingId,
        status: 'unpaid',
      });
      // // set booking status to 'invoiced' if bookingId is provided
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, { invoiced: true, invoiceCreatedAt: new Date() });
      }

      res.status(201).json(newInvoice);
    } catch (err) {
      console.error("createInvoice error:", err);
        if (err?.code === 11000) {
      return res.status(409).json({
        message: "Invoice number already exists. Please try again.",
      });
    }
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
  },
  getInvoicePdf,
  sendInvoice,
};
