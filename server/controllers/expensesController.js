// controllers/expenseController.js
const Expenses = require('../models/Expenses');
const path = require('path');
const Tesseract = require('tesseract.js');
const { fromPath } = require('pdf2pic');
const fs = require('fs-extra');
const PDFParser = require('pdf2json');
const { isValidObjectId } = require('../utils/mongoSafety');

// -------------------------
// Constants
// -------------------------
const ALLOWED_RECEIPT_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_STATEMENT_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

const MAX_OCR_PAGES = 10;
const MAX_FILENAME_LENGTH = 255;

// -------------------------
// Utility Helpers
// -------------------------
function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function safeBool(v, fallback = false) {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'boolean') return v;
  return String(v).toLowerCase() === 'true';
}

/**
 * Sanitize a filename for safe storage/display
 * - Removes path traversal sequences
 * - Limits length
 * - Removes dangerous characters
 */
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'unnamed';
  
  // Extract basename to remove any path components
  let safe = path.basename(filename);
  
  // Remove null bytes and other dangerous characters
  safe = safe.replace(/[\0<>:"/\\|?*\x00-\x1f]/g, '_');
  
  // Remove leading dots (hidden files)
  safe = safe.replace(/^\.+/, '');
  
  // Limit length
  if (safe.length > MAX_FILENAME_LENGTH) {
    const ext = path.extname(safe);
    const name = path.basename(safe, ext);
    safe = name.slice(0, MAX_FILENAME_LENGTH - ext.length - 1) + ext;
  }
  
  return safe || 'unnamed';
}

/**
 * Validate that a file path is within the expected uploads directory
 */
function isPathWithinUploads(filePath, uploadsDir) {
  if (!filePath || typeof filePath !== 'string') return false;
  
  const resolvedPath = path.resolve(filePath);
  const resolvedUploads = path.resolve(uploadsDir);
  
  return resolvedPath.startsWith(resolvedUploads + path.sep);
}

/**
 * Get the uploads directory path
 */
function getUploadsDir() {
  return path.resolve(__dirname, '..', 'uploads');
}

function resolveTrustedUploadPath(untrustedFilePath, preferredSubdir = '') {
  if (!untrustedFilePath || typeof untrustedFilePath !== 'string') return null;

  const uploadsDir = getUploadsDir();
  const safeFilename = sanitizeFilename(path.basename(untrustedFilePath));
  const candidatePath = preferredSubdir
    ? path.join(uploadsDir, preferredSubdir, safeFilename)
    : path.join(uploadsDir, safeFilename);
  const resolvedPath = path.resolve(candidatePath);
  const resolvedUploadsDir = path.resolve(uploadsDir);

  if (
    resolvedPath !== resolvedUploadsDir &&
    !resolvedPath.startsWith(resolvedUploadsDir + path.sep)
  ) {
    return null;
  }

  return resolvedPath;
}

async function getTrustedUploadPathFromFile(file) {
  if (!file || typeof file !== 'object') return null;

  const safeSourcePath = typeof file.path === 'string' ? file.path : '';
  const preferredSubdir = file.fieldname === 'statement' ? 'bank-statements' : 'receipts';

  const preferredPath = resolveTrustedUploadPath(safeSourcePath, preferredSubdir);
  if (preferredPath && await fs.pathExists(preferredPath)) {
    return preferredPath;
  }

  const uploadsRootPath = resolveTrustedUploadPath(safeSourcePath);
  if (uploadsRootPath && await fs.pathExists(uploadsRootPath)) {
    return uploadsRootPath;
  }

  return null;
}

/**
 * Validate uploaded file
 */
function validateUploadedFile(file, allowedMimes) {
  if (!file) return { valid: false, error: 'No file provided' };
  
  if (!file.path || typeof file.path !== 'string') {
    return { valid: false, error: 'Invalid file path' };
  }
  
  if (!isPathWithinUploads(file.path, getUploadsDir())) {
    return { valid: false, error: 'File path outside uploads directory' };
  }
  
  if (allowedMimes && !allowedMimes.has(file.mimetype)) {
    return { valid: false, error: `Invalid file type: ${file.mimetype}` };
  }
  
  return { valid: true };
}

/**
 * Safely remove a file if it exists and is within uploads
 */
async function safeRemoveFile(filePath) {
  try {
    const trustedPath = resolveTrustedUploadPath(filePath) || filePath;
    if (!trustedPath || !isPathWithinUploads(trustedPath, getUploadsDir())) {
      return;
    }
    if (await fs.pathExists(trustedPath)) {
      await fs.remove(trustedPath);
    }
  } catch (err) {
    console.error('Failed to remove temp file:', err.message);
  }
}

// -------------------------
// Business Logic Helpers
// -------------------------
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

  const incurredAt = body.incurredAt
    ? new Date(body.incurredAt)
    : (body.date ? new Date(body.date) : new Date());

  const status = body.status ? String(body.status).toLowerCase() : 'paid';

  const paidAt = body.paidAt
    ? new Date(body.paidAt)
    : (status === 'paid' ? incurredAt : null);

  const category = body.category ?? '';
  const craLine = body.craLine || inferCraLine(category);

  return {
    description: String(body.description ?? '').slice(0, 1000),
    category: String(category).slice(0, 200),
    categoryCode: String(body.categoryCode ?? '').slice(0, 50),
    craLine,

    currency: String(body.currency ?? 'CAD').slice(0, 10),

    amountSubtotal: toNumber(body.amountSubtotal, 0),
    taxAmount: toNumber(body.taxAmount, 0),
    amountTotal: toNumber(body.amountTotal, 0) || amount,
    amount,

    taxRate: toNumber(body.taxRate, 0),
    taxIncluded: safeBool(body.taxIncluded, false),

    incurredAt,
    paidAt,
    date: body.date ? new Date(body.date) : incurredAt,

    status: ['due', 'paid', 'issued', 'unpaid'].includes(status) ? status : 'paid',
    paymentMethod: normalizePaymentMethod(body.paymentMethod),

    accountLabel: String(body.accountLabel ?? '').slice(0, 100),

    vendorName: String(body.vendorName ?? '').slice(0, 200),
    vendorAddress: String(body.vendorAddress ?? '').slice(0, 500),
    vendorTaxId: String(body.vendorTaxId ?? '').slice(0, 50),
    invoiceNumber: String(body.invoiceNumber ?? '').slice(0, 100),

    receiptRequired: body.receiptRequired === undefined ? true : !!body.receiptRequired,

    source: String(body.source ?? 'manual').slice(0, 50),
    externalId: String(body.externalId ?? '').slice(0, 100),
    externalRef: String(body.externalRef ?? '').slice(0, 200),
    reconciled: safeBool(body.reconciled, false),
    reconciledTo: String(body.reconciledTo ?? '').slice(0, 100),

    bookingId: body.bookingId || null,
    customerId: body.customerId || null,

    businessUsePercent: body.businessUsePercent !== undefined 
      ? Math.min(100, Math.max(0, toNumber(body.businessUsePercent, 100))) 
      : 100,
    hidden: safeBool(body.hidden, false),
  };
}

function parseBankStatement(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const transactions = [];

  const monthMap = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
  };

  const headerYearMatch = rawText.match(/\b(20\d{2})\b/);
  const statementYear = headerYearMatch ? parseInt(headerYearMatch[1], 10) : new Date().getFullYear();

  function normalizeToken(token) {
    return token
      .replace(/0T/i, '01')
      .replace(/O/g, '0')
      .replace(/I/g, '1')
      .replace(/["']/g, '')
      .trim();
  }

  function parseDateToken(token) {
    const match = token.toUpperCase().match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*([0-9]{1,2})/);
    if (!match) return null;
    const month = monthMap[match[1]];
    const day = parseInt(normalizeToken(match[2]), 10);
    if (isNaN(day) || day < 1 || day > 31) return null;
    return new Date(statementYear, month, day);
  }

  for (const line of lines) {
    if (!/\$\s*\d/.test(line)) continue;

    const amountMatch = line.match(/\$([\d,]+\.\d{2})/);
    if (!amountMatch) continue;
    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

    if (!Number.isFinite(amount) || amount <= 0) continue;

    const dateMatches = line.toUpperCase().match(
      /(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[^0-9]*[0-9]{1,2}/g
    ) || [];

    const transactionDate = dateMatches[0] ? parseDateToken(dateMatches[0]) : null;
    const postingDate = dateMatches[1] ? parseDateToken(dateMatches[1]) : transactionDate;

    let description = line
      .replace(/\$[\d,]+\.\d{2}/, '')
      .replace(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[^0-9]*[0-9]{1,2}/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500);

    const date = transactionDate || postingDate;
    if (!date) {
      console.warn('Skipping line without valid date:', line.slice(0, 100));
      continue;
    }

    transactions.push({
      transactionDate: transactionDate || null,
      postingDate: postingDate || null,
      description,
      amount,
      date
    });
  }

  return transactions;
}

// -------------------------
// Controller
// -------------------------
const expensesControllers = {
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
        if (method === 'cash') match.paidAt = { $ne: null };
      }

      const expenses = await Expenses.find(match).sort({ [dateField]: -1 });
      res.json(expenses);
    } catch (err) {
      console.error('getExpenses error', err);
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  },

  createExpense: async (req, res) => {
    try {
      const payload = normalizeExpensePayload(req.body);

      let receiptUrl = '';
      let receiptFilename = '';
      let receiptMimeType = '';
      let receiptSize = 0;

      if (req.file) {
        const validation = validateUploadedFile(req.file, ALLOWED_RECEIPT_MIMES);
        if (!validation.valid) {
          await safeRemoveFile(req.file.path);
          return res.status(400).json({ error: validation.error });
        }

        const relFolder = req.file.fieldname === 'statement' ? 'bank-statements' : 'receipts';
        receiptUrl = `/uploads/${relFolder}/${path.basename(req.file.filename)}`;
        receiptFilename = sanitizeFilename(req.file.originalname);
        receiptMimeType = req.file.mimetype;
        receiptSize = req.file.size;
      }

      const expense = new Expenses({
        ...payload,
        receiptUrl,
        receiptFilename,
        receiptMimeType,
        receiptSize,
      });

      await expense.save();
      res.json(expense);
    } catch (err) {
      console.error('createExpense error', err);
      if (req.file) await safeRemoveFile(req.file.path);
      res.status(400).json({ error: err.message || 'Failed to create expense' });
    }
  },

  updateExpense: async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        if (req.file) await safeRemoveFile(req.file.path);
        return res.status(400).json({ error: 'Invalid expense ID' });
      }

      const payload = normalizeExpensePayload(req.body);
      const {
        description,
        category,
        categoryCode,
        craLine,
        currency,
        amountSubtotal,
        taxAmount,
        amountTotal,
        amount,
        taxRate,
        taxIncluded,
        incurredAt,
        paidAt,
        date,
        status,
        paymentMethod,
        accountLabel,
        vendorName,
        vendorAddress,
        vendorTaxId,
        invoiceNumber,
        receiptRequired,
        source,
        externalId,
        externalRef,
        reconciled,
        reconciledTo,
        bookingId,
        customerId,
        businessUsePercent,
        hidden,
      } = payload;

      const safeUpdate = {
        description,
        category,
        categoryCode,
        craLine,
        currency,
        amountSubtotal,
        taxAmount,
        amountTotal,
        amount,
        taxRate,
        taxIncluded,
        incurredAt,
        paidAt,
        date,
        status,
        paymentMethod,
        accountLabel,
        vendorName,
        vendorAddress,
        vendorTaxId,
        invoiceNumber,
        receiptRequired,
        source,
        externalId,
        externalRef,
        reconciled,
        reconciledTo,
        bookingId,
        customerId,
        businessUsePercent,
        hidden,
      };

      if (req.file) {
        const validation = validateUploadedFile(req.file, ALLOWED_RECEIPT_MIMES);
        if (!validation.valid) {
          await safeRemoveFile(req.file.path);
          return res.status(400).json({ error: validation.error });
        }

        const relFolder = req.file.fieldname === 'statement' ? 'bank-statements' : 'receipts';
        safeUpdate.receiptUrl = `/uploads/${relFolder}/${path.basename(req.file.filename)}`;
        safeUpdate.receiptFilename = sanitizeFilename(req.file.originalname);
        safeUpdate.receiptMimeType = req.file.mimetype;
        safeUpdate.receiptSize = req.file.size;
      }

      const updatedExpense = await Expenses.findByIdAndUpdate(id, { $set: safeUpdate }, { new: true });

      if (!updatedExpense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json(updatedExpense);
    } catch (err) {
      console.error('updateExpense error', err);
      if (req.file) await safeRemoveFile(req.file.path);
      res.status(400).json({ error: err.message || 'Failed to update expense' });
    }
  },

  deleteExpense: async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: 'Invalid expense ID' });
      }

      const deleted = await Expenses.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ success: true });
    } catch (err) {
      console.error('deleteExpense error', err);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  },

  bulkInsert: async (req, res) => {
    try {
      const { expenses } = req.body;

      if (!Array.isArray(expenses) || expenses.length === 0) {
        return res.status(400).json({ error: 'expenses must be a non-empty array' });
      }

      if (expenses.length > 500) {
        return res.status(400).json({ error: 'Maximum 500 expenses per bulk insert' });
      }

      const normalized = expenses.map((e) => normalizeExpensePayload(e));
      await Expenses.insertMany(normalized);
      res.json({ success: true, inserted: normalized.length });
    } catch (err) {
      console.error('bulkInsert error', err);
      res.status(400).json({ error: err.message || 'Failed to bulk insert' });
    }
  },

  ocrReceipt: async (req, res) => {
    let tempImages = [];

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const validation = validateUploadedFile(req.file, ALLOWED_RECEIPT_MIMES);
      if (!validation.valid) {
        await safeRemoveFile(req.file.path);
        return res.status(400).json({ error: validation.error });
      }

      const filePath = await getTrustedUploadPathFromFile(req.file);
      if (!filePath) {
        await safeRemoveFile(req.file.path);
        return res.status(400).json({ error: 'Uploaded file path is invalid' });
      }
      const ext = path.extname(req.file.originalname).toLowerCase();
      let imagePath = filePath;

      if (ext === '.pdf') {
        const uploadsDir = getUploadsDir();
        const options = {
          density: 200,
          saveFilename: `ocr-temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          savePath: uploadsDir,
          format: 'png',
          width: 800,
          height: 1000,
        };

        const convert = fromPath(filePath, options);
        const page = await convert(1, { responseType: 'image' });

        if (!page || !page.path) {
          throw new Error('Failed to convert PDF to image');
        }

        imagePath = page.path;
        tempImages.push(imagePath);
      }

      const result = await Tesseract.recognize(imagePath, 'eng');
      const text = result.data.text;

      // Cleanup
      await safeRemoveFile(filePath);
      for (const img of tempImages) {
        await safeRemoveFile(img);
      }

      return res.json({ text });
    } catch (err) {
      console.error('ocrReceipt error:', err);

      // Cleanup on error
      if (req.file) await safeRemoveFile(req.file.path);
      for (const img of tempImages) {
        await safeRemoveFile(img);
      }

      res.status(500).json({ error: 'OCR failed' });
    }
  },

  bankStatementOCR: async (req, res) => {
    let tempImages = [];

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const validation = validateUploadedFile(req.file, ALLOWED_STATEMENT_MIMES);
      if (!validation.valid) {
        await safeRemoveFile(req.file.path);
        return res.status(400).json({ error: validation.error });
      }

      const filePath = await getTrustedUploadPathFromFile(req.file);
      if (!filePath) {
        await safeRemoveFile(req.file.path);
        return res.status(400).json({ error: 'Uploaded file path is invalid' });
      }
      const ext = path.extname(req.file.originalname).toLowerCase();
      let combinedText = '';

      if (ext === '.pdf') {
        const uploadsDir = getUploadsDir();
        const options = {
          density: 200,
          saveFilename: `bank-statement-temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          savePath: uploadsDir,
          format: 'png',
          width: 1200,
          height: 1600,
        };

        const convert = fromPath(filePath, options);

        for (let pageNum = 1; pageNum <= MAX_OCR_PAGES; pageNum++) {
          try {
            const page = await convert(pageNum, { responseType: 'image' });
            if (!page || !page.path) break;

            tempImages.push(page.path);

            const result = await Tesseract.recognize(page.path, 'eng');
            combinedText += '\n' + result.data.text;
          } catch (innerErr) {
            break;
          }
        }
      } else {
        const result = await Tesseract.recognize(filePath, 'eng');
        combinedText = result.data.text;
      }

      // Cleanup temp files
      await safeRemoveFile(filePath);
      for (const imgPath of tempImages) {
        await safeRemoveFile(imgPath);
      }

      const transactions = parseBankStatement(combinedText);
      const safeFilename = sanitizeFilename(req.file.originalname);

      const expensesToInsert = transactions
        .map(tx => {
          const incurredAt = tx.date || tx.postingDate || new Date();
          return {
            description: tx.description,
            category: `Bank Import: ${safeFilename}`,
            craLine: 'interest_bank',
            amount: tx.amount,
            amountTotal: tx.amount,
            incurredAt,
            paidAt: incurredAt,
            status: 'paid',
            paymentMethod: 'bank_transfer',
            source: 'bank_import',
            externalRef: safeFilename,
            bookedOn: new Date(),
          };
        })
        .filter(exp => exp.incurredAt && !isNaN(new Date(exp.incurredAt)));

      const insertedExpenses = await Expenses.insertMany(expensesToInsert);

      return res.json({
        message: `Inserted ${insertedExpenses.length} expenses from bank statement.`,
        rawText: combinedText,
        transactions,
        insertedExpenses
      });
    } catch (err) {
      console.error('bankStatementOCR error:', err);

      if (req.file) await safeRemoveFile(req.file.path);
      for (const imgPath of tempImages) {
        await safeRemoveFile(imgPath);
      }

      res.status(500).json({ error: 'OCR failed' });
    }
  },

  parseBankStatementPDF: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const validation = validateUploadedFile(req.file, new Set(['application/pdf']));
      if (!validation.valid) {
        await safeRemoveFile(req.file.path);
        return res.status(400).json({ error: validation.error });
      }

      const filePath = await getTrustedUploadPathFromFile(req.file);
      if (!filePath) {
        await safeRemoveFile(req.file.path);
        return res.status(400).json({ error: 'Uploaded file path is invalid' });
      }

      if (!await fs.pathExists(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      const pdfParser = new PDFParser();

      // Wrap in a promise for cleaner async handling
      const parseResult = await new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', errData => {
          reject(new Error(errData.parserError || 'PDF parsing failed'));
        });

        pdfParser.on('pdfParser_dataReady', () => {
          const rawText = pdfParser.getRawTextContent();
          resolve(rawText);
        });

        pdfParser.loadPDF(filePath);
      });

      // If no text extracted, fallback to OCR
      if (!parseResult || parseResult.trim().length === 0) {
        return await expensesControllers.bankStatementOCR(req, res);
      }

      const parsedStatements = parseBankStatement(parseResult);
      const safeFilename = sanitizeFilename(req.file.originalname);

      const expensesToInsert = parsedStatements
        .map(tx => {
          const incurredAt = tx.date || tx.postingDate || new Date();
          return {
            description: tx.description,
            category: `Bank Import: ${safeFilename}`,
            craLine: 'interest_bank',
            amount: tx.amount,
            amountTotal: tx.amount,
            incurredAt,
            paidAt: incurredAt,
            status: 'paid',
            paymentMethod: 'bank_transfer',
            source: 'bank_import',
            externalRef: safeFilename,
            bookedOn: new Date(),
          };
        })
        .filter(exp => exp.incurredAt && !isNaN(new Date(exp.incurredAt)));

      const insertedExpenses = await Expenses.insertMany(expensesToInsert);

      // Cleanup
      await safeRemoveFile(filePath);

      return res.json({
        message: `Inserted ${insertedExpenses.length} expenses from bank statement.`,
        rawText: parseResult,
        transactions: expensesToInsert,
        insertedExpenses
      });
    } catch (err) {
      console.error('parseBankStatementPDF error:', err);
      if (req.file) await safeRemoveFile(req.file.path);
      return res.status(500).json({ error: 'Failed to parse statement' });
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
      res.status(500).json({ error: 'Failed to compute monthly summary' });
    }
  },
};

module.exports = expensesControllers;
