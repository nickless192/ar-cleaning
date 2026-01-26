// utils/invoicePdf.js
const PDFDocument = require("pdfkit");

/**
 * Generate a professional PDF for an invoice and return it as a Buffer.
 * @param {object} invoice - Invoice document (lean/plain object ok)
 * @param {object} opts
 * @param {object} opts.company - Company info for branding/header
 * @returns {Promise<Buffer>}
 */
function generateInvoicePdfBuffer(invoice, opts = {}) {
  const company = opts.company || {
    name: "CleanAR Solutions",
    line1: "Toronto, ON",
    email: "info@cleanarsolutions.ca",
    phone: "",
    website: "",
  };

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margin: 50,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: company.name,
        },
      });

      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // --- helpers ---
      const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

      // Header
      doc
        .fontSize(20)
        .text(company.name, { align: "left" })
        .moveDown(0.2);

      doc
        .fontSize(10)
        .fillColor("#444")
        .text(company.line1)
        .text(company.email)
        .text(company.phone || "")
        .text(company.website || "")
        .fillColor("#000");

      doc.moveDown(1);

      // Invoice meta block
      const topY = doc.y;
      doc
        .fontSize(14)
        .text("INVOICE", 50, topY, { align: "right" })
        .moveDown(0.2);

      doc
        .fontSize(10)
        .fillColor("#333")
        .text(`Invoice #: ${invoice.invoiceNumber}`, { align: "right" })
        .text(`Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`, {
          align: "right",
        })
        .text(`Status: ${(invoice.status || "unpaid").toUpperCase()}`, {
          align: "right",
        })
        .fillColor("#000");

      doc.moveDown(1);

      // Bill to
      doc.fontSize(12).text("Bill To:", { underline: true });
      doc
        .fontSize(10)
        .text(invoice.customerName || "Customer")
        .text(invoice.customerEmail || "");

      if (invoice.description) {
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor("#444").text(invoice.description);
        doc.fillColor("#000");
      }

      doc.moveDown(1);

      // Table layout
      const tableTop = doc.y;
      const colX = {
        service: 50,
        desc: 180,
        billing: 360,
        value: 420,
        price: 470,
        amount: 530,
      };

      doc.fontSize(10).fillColor("#000");

      // Table header background line
      doc
        .moveTo(50, tableTop)
        .lineTo(562, tableTop)
        .strokeColor("#111")
        .lineWidth(1)
        .stroke();

      const headerY = tableTop + 8;

      doc.fontSize(9).fillColor("#111");
      doc.text("SERVICE", colX.service, headerY);
      doc.text("DESCRIPTION", colX.desc, headerY);
      doc.text("BILL", colX.billing, headerY);
      doc.text("VALUE", colX.value, headerY, { width: 40, align: "right" });
      doc.text("PRICE", colX.price, headerY, { width: 50, align: "right" });
      doc.text("AMOUNT", colX.amount, headerY, { width: 60, align: "right" });

      doc.moveDown(1.2);

      const services = Array.isArray(invoice.services) ? invoice.services : [];
      let runningY = doc.y;

      const ensureSpace = () => {
        // simple page break protection
        if (doc.y > 720) {
          doc.addPage();
          runningY = doc.y;
        }
      };

      doc.fontSize(9).fillColor("#222");

      services.forEach((s) => {
        ensureSpace();

        const value = s.billingType === "hours" ? Number(s.hours || 0) : Number(s.quantity || 0);

        // row
        doc.text(s.serviceType || "", colX.service, doc.y, { width: 120 });
        doc.text(s.description || "", colX.desc, runningY, { width: 170 });
        doc.text((s.billingType || "").toUpperCase(), colX.billing, runningY, { width: 55 });
        doc.text(String(value), colX.value, runningY, { width: 40, align: "right" });
        doc.text(money(s.price), colX.price, runningY, { width: 50, align: "right" });
        doc.text(money(s.amount), colX.amount, runningY, { width: 60, align: "right" });

        // subtle row divider
        const rowBottom = runningY + 18;
        doc
          .moveTo(50, rowBottom)
          .lineTo(562, rowBottom)
          .strokeColor("#e6e6e6")
          .lineWidth(1)
          .stroke();

        doc.moveDown(1.2);
        runningY = doc.y;
      });

      // Totals
      doc.moveDown(0.6);
      ensureSpace();

      const subtotal = services.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
      const total = invoice.totalCost != null ? Number(invoice.totalCost) : subtotal;

      const totalsX = 380;
      doc.fontSize(10).fillColor("#111");
      doc.text("Subtotal:", totalsX, doc.y, { width: 110, align: "right" });
      doc.text(money(subtotal), totalsX + 120, doc.y - 12, { width: 70, align: "right" });

      doc.moveDown(0.4);
      doc.fontSize(12).text("Total:", totalsX, doc.y, { width: 110, align: "right" });
      doc.fontSize(12).text(money(total), totalsX + 120, doc.y - 14, { width: 70, align: "right" });

      // Footer
      doc.moveDown(2);
      doc.fontSize(9).fillColor("#444");
      doc.text("Thank you for choosing CleanAR Solutions!", { align: "center" });
      doc.fillColor("#000");

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { generateInvoicePdfBuffer };
