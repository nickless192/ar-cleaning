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
    getExpenses: async (req, res) => {
        const expenses = await Expenses.find().sort({ date: -1 });
        res.json(expenses);
    },
    createExpense: async (req, res) => {
        const { amount, category, date, description } = req.body;
        const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const expense = new Expenses({ amount, category, date, description, receiptUrl });
        await expense.save();
        res.json(expense);
    },
    updateExpense: async (req, res) => {
        const { id } = req.params;
        const { amount, category, date, description } = req.body;
        const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const updatedExpense = await Expenses.findByIdAndUpdate(id, {
            amount,
            category,
            date,
            description,
            receiptUrl
        }, { new: true });
        res.json(updatedExpense);
    },
    deleteExpense: async (req, res) => {
        await Expenses.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    },
    bulkInsert: async (req, res) => {
        const { expenses } = req.body;
        await Expenses.insertMany(expenses);
        res.json({ success: true });
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

            const expensesToInsert = transactions
                .map(tx => ({
                    description: tx.description,
                    category: 'Bank Import from file ' + req.file.originalname, // or detect dynamically
                    amount: tx.amount,
                    date: tx.date || tx.postingDate || new Date(), // fallback
                    status: 'paid',
                    paymentMethod: 'Cash',
                    bookedOn: new Date()
                }))
                .filter(exp => exp.date && !isNaN(new Date(exp.date))); // remove invalid

            console.log('--- Expenses To Insert After Filtering ---');
            console.log(JSON.stringify(expensesToInsert, null, 2));
            console.log('-----------------------------------------');


            const expenses = transactions.map(txn => ({
                date: txn.transactionDate, // Or convert to proper Date object
                description: txn.description,
                amount: txn.amount,
                category: 'Bank Import from file ' + req.file.originalname, // or detect dynamically
                source: 'Bank Statement OCR'
            }));

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
                 const expensesToInsert = parsedStatements.map(tx => ({
                    description: tx.description,
                    category: 'Bank Import from file ' + req.file.originalname, // or detect dynamically
                    amount: tx.amount,
                    date: tx.date || tx.postingDate || new Date(), // fallback
                    status: 'paid',
                    paymentMethod: 'Cash',
                    bookedOn: new Date()
                }))
                .filter(exp => exp.date && !isNaN(new Date(exp.date))); // remove invalid

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
    }
}

module.exports = expensesControllers;