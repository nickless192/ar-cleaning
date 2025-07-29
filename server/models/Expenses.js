const { Schema, model } = require('mongoose');

const expenseCategories = [
        // Marketing & Promotions
        'Advertising',
        'Promotional',
        'Car Wrapping',
        'Meals & Entertainment',

        // Fees & Dues
        'Commissions & Fees',
        'Bank Charges',
        'Dues & Subscriptions',
        'Disposal Fees',
        'Miscellaneous',

        // Office & Admin
        'Office Expenses',
        'Rent or Lease',
        'Supplies',
        'Stationary & Printing',
        'Repair & Maintenance',
        'Cellphone',
        'Utilities',
        'Website Hosting',

        // Operations & Materials
        'Cost of Labor',
        'Freight & Delivery',
        'Supplies & Materials',
        'Locker Room Rental',
        'Purchases',
        'Job Materials',

        // Travel & Vehicles
        'Airfare',
        'Hotels',
        'Travel Meals',
        'Transportation',
        'Car Leasing',
        'Entertainment',
        'Parking',

        // Professional Services
        'Legal & Professional Fees',

        // Insurance
        'Insurance - Disability',
        'Insurance - Liability',
        'Insurance - Errors & Omissions',
        'Insurance - Car',

        // Financial & Other
        'Penalties & Settlements',
        'Bad Debts',
        'Interest Expense',
        'Taxes & Licenses'
    ];

const RecurringSchema = new Schema({
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  interval: { type: Number, default: 1 }, // every N frequency
  until: { type: Date },                  // optional end date
  nextRunOn: { type: Date },              // internal helper to materialize
}, { _id: false });

const ExpenseSchema = new Schema({
  description: { type: String, required: true },
  category: {
    type: String,
    enum: expenseCategories,
    required: true
    //     // category: { type: String, enum: ['Supplies', 'Rent', 'Utilities', 'Payroll', 'Software', 'Marketing', 'Other'], default: 'Other' },
//     category: { type: String, required: true }, // Changed to required
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },   // posting date
  bookedOn: {
    type: Date, default: Date.now
  },
  status: { 
    type: String, 
    enum: ['due', 'paid', 'issued'], 
    default: 'paid' },
        paymentMethod: { 
        type: String, 
        enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Other'], default: 'Cash' 
    },
  bookingId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Booking' }, // optional (job-linked)
  recurring: RecurringSchema, // optional
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' },
}, { timestamps: true });

const Expenses = model('Expenses', ExpenseSchema);

module.exports = Expenses;

