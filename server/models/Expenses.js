const { Schema, model, Types } = require('mongoose');

const ExpenseSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    // category: { type: String, enum: ['Supplies', 'Rent', 'Utilities', 'Payroll', 'Software', 'Marketing', 'Other'], default: 'Other' },
    category: { type: String, required: true }, // Changed to required
    paymentMethod: { 
        type: String, 
        enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Other'], default: 'Cash' 
    },
    paymentDate: { type: Date, required: true },
    isRecurring: { type: Boolean, default: false },
    recurrence: {
        frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'], default: 'Monthly' },
        interval: { type: Number, default: 1 }, // every 1 month, every 2 weeks, etc.
        endDate: { type: Date } // optional: stop recurrence
    },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Expense = model('Expense', ExpenseSchema);

module.exports = Expense;
