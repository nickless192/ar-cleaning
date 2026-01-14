// controllers/expenseController.js
const Expenses = require('../models/Expenses');
const path = require('path');
const Tesseract = require('tesseract.js');
const { fromPath } = require('pdf2pic');
const fs = require('fs-extra');
const PDFParser = require('pdf2json');

// function parseBankStatement(text) {
//     const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
//     const transactions = [];

//     // Basic regex example (adjust based on actual statement format)
//     const transactionRegex = /^(\d{2}\/\d{2})\s+(\d{2}\/\d{2})\s+(.+?)\s+(-?\d+\.?\d*)$/;

//     for (const line of lines) {
//         const match = line.match(transactionRegex);
//         if (match) {
//             const [, transactionDate, postingDate, description, amount] = match;
//             transactions.push({
//                 transactionDate,
//                 postingDate,
//                 description,
//                 amount: parseFloat(amount.replace(',', '')),
//             });
//         }
//     }

//     return transactions;
// }
// function parseBankStatement(text) {
//     const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
//     const transactions = [];

//     const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
//     const monthRegex = /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)/i;

//     const cleanLine = (line) => {
//         return line
//             .replace(/[“”"']/g, '')          // Remove weird OCR quotes
//             .replace(/O/g, '0')              // OCR often confuses O with 0
//             .replace(/l/g, '1')              // OCR often confuses l with 1
//             .replace(/\s+/g, ' ')            // Normalize spacing
//             .trim();
//     };

//     // Regex for two dates + description + amount
//     // Example: MAY15 MAY 15 PAYMENT $1,800.00
//     const txnRegex = new RegExp(
//         `(${months.join('|')})\\s?(\\d{1,2})\\s+` + // Transaction date
//         `(${months.join('|')})\\s?(\\d{1,2})\\s+` + // Posting date
//         `(.+?)\\s+\\$?(-?\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2})?)$`, 'i'
//     );

//     for (let rawLine of lines) {
//         const line = cleanLine(rawLine);

//         // Skip obvious non-transaction lines
//         if (!monthRegex.test(line)) continue;

//         const match = line.match(txnRegex);
//         if (match) {
//             const [, txnMonth, txnDay, postMonth, postDay, description, amountStr] = match;

//             transactions.push({
//                 transactionDate: `${txnMonth.toUpperCase()} ${txnDay.padStart(2, '0')}`,
//                 postingDate: `${postMonth.toUpperCase()} ${postDay.padStart(2, '0')}`,
//                 description: description.trim(),
//                 amount: parseFloat(amountStr.replace(/,/g, ''))
//             });
//         }
//     }

//     return transactions;
// }

function toNumber(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}
function safeBool(v, fallback = false) {
    if (v === undefined || v === null) return fallback;
    if (typeof v === 'boolean') return v;
    return String(v).toLowerCase() === 'true';
}
function toNumber(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}
function normalizePaymentMethod(v) {
    if (!v) return 'unknown';
    const s = String(v).toLowerCase().trim();
    if (s === 'cash') return 'cash';
    if (['credit card', 'credit_card', 'credit', 'visa', 'mastercard', 'amex'].includes(s)) return 'credit_card';
    if (['debit card', 'debit_card', 'debit'].includes(s)) return 'debit_card';
    if (['bank transfer', 'bank_transfer', 'transfer', 'ach', 'eft'].includes(s)) return 'bank_transfer';
    if (['e-transfer', 'etransfer', 'e transfer', 'interac'].includes(s)) return 'e-transfer';
    if (s === 'paypal') return 'paypal';
    if (['cheque', 'check'].includes(s)) return 'cheque';
    if (s === 'other') return 'other';
    return 'unknown';
}

// Minimal mapping to CRA lines (adjust over time)
function inferCraLine(category = '') {
    const c = String(category).toLowerCase();
    if (c.includes('meal') || c.includes('entertainment')) return 'meals_entertainment';
    if (c.includes('advert') || c.includes('promo') || c.includes('wrapping')) return 'advertising';
    if (c.includes('rent') || c.includes('lease')) return 'rent';
    if (c.includes('repair') || c.includes('maintenance')) return 'repairs_maintenance';
    if (c.includes('suppl')) return 'supplies';
    if (c.includes('labor') || c.includes('wage') || c.includes('subcontract')) return 'salaries_wages_subcontracts';
    if (c.includes('legal') || c.includes('professional')) return 'legal_accounting';
    if (c.includes('insurance')) return 'insurance';
    if (c.includes('interest') || c.includes('bank charge')) return 'interest_bank';
    if (c.includes('cell') || c.includes('phone') || c.includes('internet') || c.includes('hosting')) return 'telephone_internet';
    if (c.includes('travel') || c.includes('airfare') || c.includes('hotel')) return 'travel';
    if (c.includes('car') || c.includes('parking') || c.includes('vehicle')) return 'motor_vehicle';
    if (c.includes('utilit')) return 'utilities';
    if (c.includes('office')) return 'office';
    return 'other';
}

function normalizeExpensePayload(body) {
    const amount = toNumber(body.amount, 0);

    const incurredAt =
        body.incurredAt ? new Date(body.incurredAt)
            : (body.date ? new Date(body.date) : new Date());

    const status = body.status ? String(body.status).toLowerCase() : 'paid';

    const paidAt =
        body.paidAt ? new Date(body.paidAt)
            : (status === 'paid' ? incurredAt : null);

    const category = body.category ?? '';
    const craLine = body.craLine || inferCraLine(category);

    return {
        description: body.description ?? '',
        category,
        categoryCode: body.categoryCode ?? '',
        craLine,

        currency: body.currency ?? 'CAD',

        amountSubtotal: toNumber(body.amountSubtotal, 0),
        taxAmount: toNumber(body.taxAmount, 0),
        amountTotal: toNumber(body.amountTotal, 0) || amount,
        amount, // legacy compatibility

        taxRate: toNumber(body.taxRate, 0),
        taxIncluded: body.taxIncluded === true || String(body.taxIncluded).toLowerCase() === 'true',

        incurredAt,
        paidAt,
        date: body.date ? new Date(body.date) : incurredAt, // legacy

        status: ['due', 'paid', 'issued', 'unpaid'].includes(status) ? status : 'paid',
        paymentMethod: normalizePaymentMethod(body.paymentMethod),

        vendorName: body.vendorName ?? '',
        vendorTaxId: body.vendorTaxId ?? '',
        invoiceNumber: body.invoiceNumber ?? '',

        source: body.source ?? 'manual',
        externalId: body.externalId ?? '',
        externalRef: body.externalRef ?? '',
        reconciled: body.reconciled === true || String(body.reconciled).toLowerCase() === 'true',
        reconciledTo: body.reconciledTo ?? '',

        bookingId: body.bookingId || null,
        customerId: body.customerId || null,

        hidden: body.hidden === true || String(body.hidden).toLowerCase() === 'true',
    };
}


function normalizePaymentMethod(v) {
    if (!v) return 'unknown';
    const s = String(v).toLowerCase().trim();

    if (['cash'].includes(s)) return 'cash';
    if (['credit card', 'credit_card', 'credit', 'visa', 'mastercard', 'amex'].includes(s)) return 'credit_card';
    if (['debit card', 'debit_card', 'debit'].includes(s)) return 'debit_card';
    if (['bank transfer', 'bank_transfer', 'transfer', 'ach', 'eft'].includes(s)) return 'bank_transfer';
    if (['e-transfer', 'etransfer', 'e transfer', 'interac'].includes(s)) return 'e-transfer';
    if (['paypal'].includes(s)) return 'paypal';
    if (['cheque', 'check'].includes(s)) return 'cheque';
    if (['other'].includes(s)) return 'other';

    return 'unknown';
}

// Backwards-compatible mapping:
// UI sends `date` => treat as incurredAt (accrual date)
function normalizeExpensePayload(body) {
    const amount = toNumber(body.amount, 0);

    const incurredAt = body.incurredAt
        ? new Date(body.incurredAt)
        : (body.date ? new Date(body.date) : new Date());

    const status = body.status ? String(body.status).toLowerCase() : 'paid';

    const paidAt =
        body.paidAt ? new Date(body.paidAt)
            : (status === 'paid' ? incurredAt : null);

    return {
        description: body.description ?? '',
        category: body.category ?? '',
        categoryCode: body.categoryCode ?? '',
        currency: body.currency ?? 'CAD',

        // If you’re not collecting tax yet, keep it simple:
        amountSubtotal: toNumber(body.amountSubtotal, 0),
        taxAmount: toNumber(body.taxAmount, 0),
        amountTotal: toNumber(body.amountTotal, 0) || amount, // prefer amountTotal if provided
        amount, // keep legacy field aligned (schema pre-validate also aligns)

        taxRate: toNumber(body.taxRate, 0),
        taxIncluded: String(body.taxIncluded).toLowerCase() === 'true' || body.taxIncluded === true,

        incurredAt,
        paidAt,

        status: ['due', 'paid', 'issued', 'unpaid'].includes(status) ? status : 'paid',
        paymentMethod: normalizePaymentMethod(body.paymentMethod),

        accountLabel: body.accountLabel ?? '',

        vendorName: body.vendorName ?? '',
        vendorAddress: body.vendorAddress ?? '',
        vendorTaxId: body.vendorTaxId ?? '',

        receiptRequired: body.receiptRequired === undefined ? true : !!body.receiptRequired,

        source: body.source ?? 'manual',
        externalId: body.externalId ?? '',
        externalRef: body.externalRef ?? '',
        reconciled: body.reconciled === true || String(body.reconciled).toLowerCase() === 'true',
        reconciledTo: body.reconciledTo ?? '',

        bookingId: body.bookingId || null,
        customerId: body.customerId || null,

        businessUsePercent: body.businessUsePercent !== undefined ? toNumber(body.businessUsePercent, 100) : 100,
        hidden: body.hidden === true || String(body.hidden).toLowerCase() === 'true',
    };
}

function parseBankStatement(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    const transactions = [];
    const monthMap = {
        JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
        JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
    };

    // Try to detect year from header (fallback to current year)
    const headerYearMatch = rawText.match(/\b(20\d{2})\b/);
    const statementYear = headerYearMatch ? parseInt(headerYearMatch[1], 10) : new Date().getFullYear();

    function normalizeToken(token) {
        return token
            .replace(/0T/i, '01') // JUN0T -> JUN01
            .replace(/O/g, '0')   // letter O -> 0
            .replace(/I/g, '1')   // letter I -> 1
            .replace(/["']/g, '') // remove stray quotes
            .trim();
    }

    function parseDateToken(token) {
        const match = token.toUpperCase().match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*([0-9]{1,2})/);
        if (!match) return null;
        const month = monthMap[match[1]];
        const day = parseInt(normalizeToken(match[2]), 10);
        if (isNaN(day)) return null;
        return new Date(statementYear, month, day);
    }

    for (let line of lines) {
        if (!/\$\s*\d/.test(line)) continue; // must contain a $

        // Extract amount
        const amountMatch = line.match(/\$([\d,]+\.\d{2})/);
        if (!amountMatch) continue;
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

        // Extract possible two dates
        const dateMatches = line.toUpperCase().match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[^0-9]*[0-9]{1,2}/g) || [];
        const transactionDate = dateMatches[0] ? parseDateToken(dateMatches[0]) : null;
        const postingDate = dateMatches[1] ? parseDateToken(dateMatches[1]) : transactionDate;

        // Description = line without dates and amount
        let description = line
            .replace(/\$[\d,]+\.\d{2}/, '')
            .replace(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[^0-9]*[0-9]{1,2}/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Always pick a date (prefer transaction date, fallback to posting)
        const date = transactionDate || postingDate;
        if (!date) {
            console.warn('Skipping line without valid date:', line);
            continue;
        }

        transactions.push({
            transactionDate: transactionDate || null,
            postingDate: postingDate || null,
            description,
            amount,
            date // For Mongoose schema required
        });
    }

    return transactions;
}


const expensesControllers = {
    // getExpenses: async (req, res) => {
    //     // const expenses = await Expenses.find().sort({ date: -1 });
    //     const expenses = await Expenses.find().sort({ incurredAt: -1, date: -1 });

    //     res.json(expenses);
    // },
  getExpenses: async (req, res) => {
  try {
    const method = req.query.method === 'cash' ? 'cash' : 'accrual';
    const dateField = method === 'cash' ? 'paidAt' : 'incurredAt';

    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    const includeHidden = safeBool(req.query.includeHidden, false);

    const match = {
      ...(includeHidden ? {} : { hidden: { $ne: true } }),
    };

    if (from && to) {
      match[dateField] = { $gte: from, $lte: to };
      // cash requires a paidAt
      if (method === 'cash') match.paidAt = { $ne: null };
    }

    const expenses = await Expenses.find(match).sort({ [dateField]: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('getExpenses error', err);
    res.status(500).json({ error: err.message || 'Failed to fetch expenses' });
  }
},


    // createExpense: async (req, res) => {
    //     const { amount, category, date, description } = req.body;
    //     const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    //     const expense = new Expenses({ amount, category, date, description, receiptUrl });
    //     await expense.save();
    //     res.json(expense);
    // },
    createExpense: async (req, res) => {
        try {
            const payload = normalizeExpensePayload(req.body);

            let receiptUrl = '';
            if (req.file) {
                // IMPORTANT: your static route should serve /uploads/*
                // and multer saves under /uploads/receipts or /uploads/bank-statements
                const relFolder = req.file.fieldname === 'statement' ? 'bank-statements' : 'receipts';
                receiptUrl = `/uploads/${relFolder}/${req.file.filename}`;
            }

            const expense = new Expenses({
                ...payload,
                receiptUrl,
                receiptFilename: req.file?.originalname || '',
                receiptMimeType: req.file?.mimetype || '',
                receiptSize: req.file?.size || 0,
            });

            await expense.save();
            res.json(expense);
        } catch (err) {
            console.error('createExpense error', err);
            res.status(400).json({ error: err.message || 'Failed to create expense' });
        }
    },


    // updateExpense: async (req, res) => {
    //     const { id } = req.params;
    //     const { amount, category, date, description } = req.body;
    //     const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;
    //     const updatedExpense = await Expenses.findByIdAndUpdate(id, {
    //         amount,
    //         category,
    //         date,
    //         description,
    //         receiptUrl
    //     }, { new: true });
    //     res.json(updatedExpense);
    // },
    updateExpense: async (req, res) => {
        try {
            const { id } = req.params;
            const payload = normalizeExpensePayload(req.body);

            const update = { ...payload };

            if (req.file) {
                const relFolder = req.file.fieldname === 'statement' ? 'bank-statements' : 'receipts';
                update.receiptUrl = `/uploads/${relFolder}/${req.file.filename}`;
                update.receiptFilename = req.file.originalname || '';
                update.receiptMimeType = req.file.mimetype || '';
                update.receiptSize = req.file.size || 0;
            }

            const updatedExpense = await Expenses.findByIdAndUpdate(id, update, { new: true });
            res.json(updatedExpense);
        } catch (err) {
            console.error('updateExpense error', err);
            res.status(400).json({ error: err.message || 'Failed to update expense' });
        }
    },


    deleteExpense: async (req, res) => {
        await Expenses.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    },
    // bulkInsert: async (req, res) => {
    //     const { expenses } = req.body;
    //     await Expenses.insertMany(expenses);
    //     res.json({ success: true });
    // },
  bulkInsert: async (req, res) => {
  try {
    const { expenses } = req.body;
    const normalized = (expenses || []).map((e) => normalizeExpensePayload(e));
    await Expenses.insertMany(normalized);
    res.json({ success: true, inserted: normalized.length });
  } catch (err) {
    console.error('bulkInsert error', err);
    res.status(400).json({ error: err.message || 'Failed to bulk insert' });
  }
},


    ocrReceipt: async (req, res) => {
        const filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        let imagePath = filePath;

        try {
            if (ext === '.pdf') {
                // Convert PDF to image (only page 1 for now)
                // Convert PDF page 1 to PNG
                const uploadsDir = path.resolve(__dirname, '..', 'uploads');
                const options = {
                    density: 200,
                    saveFilename: `ocr-temp-${Date.now()}`,
                    savePath: uploadsDir,
                    format: 'png',
                    width: 800,
                    height: 1000,
                };

                const convert = fromPath(filePath, options);
                //   const page = await convert(1); // Returns a Promise<{ path: string, ... }>
                const pageToConvertAsImage = 1;

                const page = await convert(pageToConvertAsImage, { responseType: 'image' });

                console.log('Page 1 is now converted as image:', page.path);
                imagePath = page.path;
            }

            const result = await Tesseract.recognize(imagePath, 'eng', {
                // logger: m => console.log(m), // optional progress logging
            });

            const text = result.data.text;
            await fs.remove(filePath); // clean up temp
            if (ext === '.pdf') await fs.remove(imagePath);

            return res.json({ text });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'OCR failed' });
        }
    },
    bankStatementOCR: async (req, res) => {
        const filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        let imagePath = filePath;
        let tempImages = [];

        try {
            let combinedText = '';
            if (ext === '.pdf') {
                // Convert PDF to image (only page 1 for now)
                const uploadsDir = path.resolve(__dirname, '..', 'uploads');
                const options = {
                    density: 200,
                    saveFilename: `bank-statement-temp-${Date.now()}`,
                    savePath: uploadsDir,
                    format: 'png',
                    width: 1200, // Wider for statements
                    height: 1600,
                };

                const convert = fromPath(filePath, options);
                // pdf2pic doesn’t directly return total pages, 
                // but Tesseract can process sequentially if you try pages in a loop
                // We'll try first 10 pages as a safe default (can adjust)
                const maxPages = 10;
                for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                    try {
                        const page = await convert(pageNum, { responseType: 'image' });
                        if (!page || !page.path) break;
                        tempImages.push(page.path);

                        const result = await Tesseract.recognize(page.path, 'eng');
                        combinedText += '\n' + result.data.text;
                    } catch (innerErr) {
                        // break if page doesn't exist
                        break;
                    }
                }
                // const pageToConvertAsImage = 1;

                // const page = await convert(pageToConvertAsImage, { responseType: 'image' });
                // imagePath = page.path;

                // const result = await Tesseract.recognize(imagePath, 'eng', {
                //     // logger: m => console.log(m), // optional progress logging
                // });
            } else {
                // If it's an image, just OCR it
                const result = await Tesseract.recognize(filePath, 'eng');
                combinedText = result.data.text;
            }


            // const rawText = result.data.text;

            // Step 3: Cleanup temp files
            await fs.remove(filePath);
            // if (ext === '.pdf') await fs.remove(imagePath);
            for (const imgPath of tempImages) {
                await fs.remove(imgPath);
            }

            // Step 4: Basic parsing attempt
            const transactions = parseBankStatement(combinedText);
            console.log('--- Parsed Transactions ---');
            console.log(JSON.stringify(transactions, null, 2));
            console.log('---------------------------');

            // const expensesToInsert = transactions
            //     .map(tx => ({
            //         description: tx.description,
            //         category: 'Bank Import from file ' + req.file.originalname, // or detect dynamically
            //         amount: tx.amount,
            //         date: tx.date || tx.postingDate || new Date(), // fallback
            //         status: 'paid',
            //         paymentMethod: 'Cash',
            //         bookedOn: new Date()
            //     }))
            //     .filter(exp => exp.date && !isNaN(new Date(exp.date))); // remove invalid
           const expensesToInsert = transactions
  .map(tx => {
    const incurredAt = tx.date || tx.postingDate || new Date();
    return {
      description: tx.description,
      category: `Bank Import: ${req.file.originalname}`,
      craLine: 'interest_bank', // default; you can change later in UI
      amount: tx.amount,
      amountTotal: tx.amount,
      incurredAt,
      paidAt: incurredAt,              // bank statement = cash movement
      status: 'paid',
      paymentMethod: 'bank_transfer',  // safer default than 'cash'
      source: 'bank_import',
      externalRef: req.file.originalname,
      bookedOn: new Date(),
    };
  })
  .filter(exp => exp.incurredAt && !isNaN(new Date(exp.incurredAt)));



            console.log('--- Expenses To Insert After Filtering ---');
            console.log(JSON.stringify(expensesToInsert, null, 2));
            console.log('-----------------------------------------');


            // const expenses = transactions.map(txn => ({
            //     date: txn.transactionDate, // Or convert to proper Date object
            //     description: txn.description,
            //     amount: txn.amount,
            //     category: 'Bank Import from file ' + req.file.originalname, // or detect dynamically
            //     source: 'Bank Statement OCR'
            // }));

            const insertedExpenses = await Expenses.insertMany(expensesToInsert);

            return res.json({
                message: `Inserted ${insertedExpenses.length} expenses from bank statement.`,
                rawText: combinedText,
                transactions,
                insertedExpenses
            });

            // return res.json({ rawText, transactions });

            // return res.json({ text });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'OCR failed' });
        }
    },
    parseBankStatementPDF: async (req, res) => {
        try {
            const filePath = req.file.path;
            // const { filename } = req.body;
            // const filePath = path.resolve("uploads", filename); // Adjust path if needed

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: "File not found" });
            }

            const pdfParser = new PDFParser();

            pdfParser.on("pdfParser_dataError", errData => {
                console.error("PDF Parser Error:", errData.parserError);
                return res.status(500).json({ error: "Failed to parse PDF." });
            });

            pdfParser.on("pdfParser_dataReady", async pdfData => {
                const rawText = pdfParser.getRawTextContent();
                console.log("Raw PDF Text:", rawText);
                if (!rawText) {
                    return await expensesControllers.bankStatementOCR(req, res); // Fallback to OCR if no text found
                }
                const parsedStatements = parseBankStatement(rawText);
                //  const expensesToInsert = parsedStatements.map(tx => ({
                //     description: tx.description,
                //     category: 'Bank Import from file ' + req.file.originalname, // or detect dynamically
                //     amount: tx.amount,
                //     date: tx.date || tx.postingDate || new Date(), // fallback
                //     status: 'paid',
                //     paymentMethod: 'Cash',
                //     bookedOn: new Date()
                // }))
                // .filter(exp => exp.date && !isNaN(new Date(exp.date))); // remove invalid
             const expensesToInsert = parsedStatements
  .map(tx => {
    const incurredAt = tx.date || tx.postingDate || new Date();
    return {
      description: tx.description,
      category: `Bank Import: ${req.file.originalname}`,
      craLine: 'interest_bank', // default; you can change later in UI
      amount: tx.amount,
      amountTotal: tx.amount,
      incurredAt,
      paidAt: incurredAt,              // bank statement = cash movement
      status: 'paid',
      paymentMethod: 'bank_transfer',  // safer default than 'cash'
      source: 'bank_import',
      externalRef: req.file.originalname,
      bookedOn: new Date(),
    };
  })
  .filter(exp => exp.incurredAt && !isNaN(new Date(exp.incurredAt)));



                // return res.json({ statements: parsedStatements });
                const insertedExpenses = await Expenses.insertMany(expensesToInsert);

                return res.json({
                    message: `Inserted ${insertedExpenses.length} expenses from bank statement.`,
                    rawText,
                    transactions: expensesToInsert,
                    insertedExpenses
                });
            });
            pdfParser.loadPDF(filePath);


            // return res.json({ expenses });
        } catch (err) {
            console.error('Error parsing PDF:', err);
            return res.status(500).json({ message: 'Failed to parse statement', error: err.message });
        }
    },
    monthlySummary: async (req, res) => {
  try {
    const method = req.query.method === 'cash' ? 'cash' : 'accrual';
    const dateField = method === 'cash' ? '$paidAt' : '$incurredAt';

    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    const includeHidden = safeBool(req.query.includeHidden, false);

    const match = {
      ...(includeHidden ? {} : { hidden: { $ne: true } }),
    };

    if (from && to) {
      match[method === 'cash' ? 'paidAt' : 'incurredAt'] = { $gte: from, $lte: to };
      if (method === 'cash') match.paidAt = { $ne: null };
    }

    const items = await Expenses.aggregate([
      { $match: match },
      {
        $project: {
          amountTotal: { $ifNull: ['$amountTotal', '$amount'] },
          month: { $dateToString: { format: '%Y-%m', date: dateField } },
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: '$amountTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          total: 1,
          count: 1,
        },
      },
    ]);

    res.json({ method, items });
  } catch (err) {
    console.error('monthlySummary error', err);
    res.status(500).json({ error: err.message || 'Failed to compute monthly summary' });
  }
},

}

module.exports = expensesControllers;