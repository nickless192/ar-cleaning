const PDFDocument = require("pdfkit");

console.log("✅ LOADED invoicePdf.js from:", __filename);

/**
 * Generate a professional PDF for an invoice and return it as a Buffer.
 */
function generateInvoicePdfBuffer(invoice, opts = {}) {
  const company = opts.company || {
    line1: "Toronto, ON, Canada",
    email: "info@cleanarsolutions.ca",
    phone: "437-440-5514",
    website: "www.cleanarsolutions.ca",
  };

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margin: 50,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: "CleanAR Solutions",
        },
      });

      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ---------------------
      // Page metrics
      // ---------------------
      const leftX = doc.page.margins.left;
      const rightX = doc.page.width - doc.page.margins.right;
      const contentWidth = rightX - leftX;

      // ---------------------
      // Helpers
      // ---------------------
      const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

      const drawHLine = (y, color = "#e6e6e6") => {
        doc.moveTo(leftX, y).lineTo(rightX, y).strokeColor(color).lineWidth(1).stroke();
      };

      const ensureSpace = (needed = 60) => {
        const bottomLimit = doc.page.height - doc.page.margins.bottom - 90;
        if (doc.y + needed > bottomLimit) {
          doc.addPage();
        }
      };

      // =========================================================
      // HEADER
      // =========================================================
      const headerTopY = 40;

      // Logo
      const logoMaxW = 175;
      const logoMaxH = 95;
      const hasLogo = Boolean(opts.logoPath || opts.logoBuffer);

      let leftColumnY = headerTopY;

      if (hasLogo) {
        try {
          const imgSrc = opts.logoBuffer || opts.logoPath;
          doc.image(imgSrc, leftX, leftColumnY, {
            fit: [logoMaxW, logoMaxH],
            align: "left",
            valign: "top",
          });
          leftColumnY += logoMaxH + 6;
        } catch (e) {
          console.warn("Invoice PDF: logo failed to render:", e.message);
        }
      }

      // Company info under logo
      const companyInfo = [
        company.line1,
        company.email,
        company.phone,
        company.website,
      ].filter(Boolean).join("\n");

      doc.font("Helvetica").fontSize(11).fillColor("#333");
      doc.text(companyInfo, leftX, leftColumnY, {
        width: logoMaxW + 10,
      });
      doc.fillColor("#000");

      const companyInfoHeight = doc.heightOfString(companyInfo, {
        width: logoMaxW + 10,
      });

      const leftBottomY = leftColumnY + companyInfoHeight;

      // Invoice meta (RIGHT — fixed Y, no cursor pollution)
      const metaW = 220;
      const metaX = rightX - metaW;

      const metaTitleY = headerTopY + 6;
      const metaLine1Y = metaTitleY + 22;
      const metaLine2Y = metaLine1Y + 16;
      const metaLine3Y = metaLine2Y + 16;

      doc.font("Helvetica-Bold").fontSize(18);
      doc.text("INVOICE", metaX, metaTitleY, { width: metaW, align: "right" });

      doc.font("Helvetica").fontSize(11).fillColor("#333");
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, metaX, metaLine1Y, {
        width: metaW,
        align: "right",
      });

      const rawDate = invoice.date || invoice.createdAt || Date.now();
      doc.text(`Date: ${new Date(rawDate).toLocaleDateString()}`, metaX, metaLine2Y, {
        width: metaW,
        align: "right",
      });

      doc.text(`Status: ${(invoice.status || "unpaid").toUpperCase()}`, metaX, metaLine3Y, {
        width: metaW,
        align: "right",
      });

      doc.fillColor("#000");

      const metaBottomY = metaLine3Y + 18;

      // Header bottom
      doc.y = Math.max(leftBottomY, metaBottomY) + 12;
      drawHLine(doc.y);
      doc.y += 14;

      // =========================================================
      // BILL TO
      // =========================================================
      let y = doc.y;

      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Bill To:", leftX, y, { underline: true });
      y += 18;

      doc.font("Helvetica").fontSize(11);
      doc.text(invoice.customerName || "Customer", leftX, y);
      y += 16;

      doc.fontSize(10);
      doc.text(invoice.customerEmail || "", leftX, y);
      y += 14;

      if (invoice.description) {
        doc.fontSize(10).fillColor("#444");
        doc.text(invoice.description, leftX, y, { width: contentWidth * 0.7 });
        y += doc.heightOfString(invoice.description, { width: contentWidth * 0.7 }) + 6;
        doc.fillColor("#000");
      }

      doc.y = y + 10;

      // =========================================================
      // TABLE
      // =========================================================
      const colW = {
        service: Math.floor(contentWidth * 0.22),
        desc: Math.floor(contentWidth * 0.33),
        bill: Math.floor(contentWidth * 0.12),
        value: Math.floor(contentWidth * 0.08),
        price: Math.floor(contentWidth * 0.12),
      };
      colW.amount = contentWidth - Object.values(colW).reduce((a, b) => a + b, 0);

      const colX = {
        service: leftX,
        desc: leftX + colW.service,
        bill: leftX + colW.service + colW.desc,
        value: leftX + colW.service + colW.desc + colW.bill,
        price: leftX + colW.service + colW.desc + colW.bill + colW.value,
        amount: leftX + colW.service + colW.desc + colW.bill + colW.value + colW.price,
      };

      drawHLine(doc.y, "#111");
      const thY = doc.y + 8;

      doc.fontSize(9).fillColor("#111");
      doc.text("SERVICE", colX.service, thY);
      doc.text("DESCRIPTION", colX.desc, thY);
      doc.text("BILL", colX.bill, thY);
      doc.text("VALUE", colX.value, thY, { align: "right", width: colW.value });
      doc.text("PRICE", colX.price, thY, { align: "right", width: colW.price });
      doc.text("AMOUNT", colX.amount, thY, { align: "right", width: colW.amount });

      drawHLine(thY + 18);
      doc.y = thY + 30;

      const services = invoice.services || [];
      doc.fontSize(9).fillColor("#222");

      services.forEach((s) => {
        const value = s.billingType === "hours" ? s.hours : s.quantity;
        const rowHeight =
          Math.max(
            doc.heightOfString(s.serviceType || "", { width: colW.service }),
            doc.heightOfString(s.description || "", { width: colW.desc }),
            14
          ) + 8;

        ensureSpace(rowHeight + 40);

        const y0 = doc.y;

        doc.text(s.serviceType || "", colX.service, y0, { width: colW.service });
        doc.text(s.description || "", colX.desc, y0, { width: colW.desc });
        doc.text((s.billingType || "").toUpperCase(), colX.bill, y0);
        doc.text(String(value), colX.value, y0, { align: "right", width: colW.value });
        doc.text(money(s.price), colX.price, y0, { align: "right", width: colW.price });
        doc.text(money(s.amount), colX.amount, y0, { align: "right", width: colW.amount });

        drawHLine(y0 + rowHeight - 2);
        doc.y = y0 + rowHeight + 6;
      });

      // =========================================================
      // TOTALS
      // =========================================================
      ensureSpace(120);

      const subtotal = services.reduce((s, i) => s + Number(i.amount || 0), 0);
      const total = invoice.totalCost ?? subtotal;

      const totalsX = rightX - 240;

      doc.fontSize(10);
      doc.text("Subtotal:", totalsX, doc.y + 6, { align: "right", width: 150 });
      doc.text(money(subtotal), totalsX + 150, doc.y - 12, { align: "right", width: 90 });

      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Total:", totalsX, doc.y + 10, { align: "right", width: 150 });
      doc.text(money(total), totalsX + 150, doc.y - 14, { align: "right", width: 90 });

      doc.font("Helvetica").fontSize(10);
      doc.y += 24;

      // =========================================================
      // NOTES (optional)
      // =========================================================
      const notes = invoice.notes || invoice.note || invoice.internalNotes;

      if (notes) {
        ensureSpace(110);
        drawHLine(doc.y);
        doc.y += 10;

        doc.font("Helvetica-Bold").fontSize(10);
        doc.text("Notes", leftX, doc.y, { underline: true });
        doc.y += 8;

        doc.font("Helvetica").fontSize(9).fillColor("#444");
        doc.text(notes, leftX, doc.y, { width: contentWidth, lineGap: 2 });
        doc.fillColor("#000");

        doc.y += 14;
      }

      // =========================================================
      // FOOTER
      // =========================================================
      doc.font("Helvetica").fontSize(9).fillColor("#444");
      doc.text(
        "Thank you for choosing CleanAR Solutions!",
        leftX,
        doc.page.height - doc.page.margins.bottom - 40,
        { width: contentWidth, align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateInvoicePdfBuffer };
