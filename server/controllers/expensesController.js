// controllers/expenseController.js
const Expenses = require('../models/Expenses');
const path = require('path');
const Tesseract = require('tesseract.js');
const { fromPath } = require('pdf2pic');
const fs = require('fs-extra');

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
    }
}

module.exports = expensesControllers;