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

// CRA/T2125-style “line” mapping (useful even if corporate)
const CRA_LINES = [
  'advertising',
  'meals_entertainment',
  'office',
  'rent',
  'repairs_maintenance',
  'supplies',
  'salaries_wages_subcontracts',
  'legal_accounting',
  'insurance',
  'interest_bank',
  'telephone_internet',
  'travel',
  'motor_vehicle',
  'utilities',
  'other'
];

const RecurringSchema = new Schema({
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  interval: { type: Number, default: 1 },
  until: { type: Date },
  nextRunOn: { type: Date },
}, { _id: false });

const ExpenseSchema = new Schema({
  // Core
  description: { type: String, required: true, trim: true },

  // Human category + optional “code” bucket for stable reporting
  category: { type: String, required: true, trim: true }, // keep flexible
  categoryCode: { type: String, trim: true, default: '' }, // e.g. "SUPPLIES_CLEANING"
  craLine: { type: String, enum: CRA_LINES, default: 'other' }, // accounting bucket

  currency: { type: String, default: 'CAD' },

  // Amounts (tax-ready)
  // If you aren’t collecting tax yet, you can still set amountTotal and leave the rest 0.
  amountSubtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  amountTotal: { type: Number, required: true },     // <- canonical total
  amount: { type: Number, default: 0 },              // <- legacy compatibility

  taxRate: { type: Number, default: 0 },             // e.g. 0.13
  taxIncluded: { type: Boolean, default: false },    // if receipt total already includes tax

  // Cash vs accrual support:
  // - accrual: use incurredAt
  // - cash: use paidAt
  incurredAt: { type: Date, required: true },        // when expense is incurred / posted
  paidAt: { type: Date, default: null },             // when paid (cash basis)
  date: { type: Date },                              // legacy compatibility (optional)
  bookedOn: { type: Date, default: Date.now },       // created/entered in system

  status: { type: String, enum: ['due', 'paid', 'issued', 'unpaid'], default: 'paid' },

  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'e-transfer', 'paypal', 'cheque', 'other', 'unknown'],
    default: 'unknown'
  },

  // Vendor / reference (reconciliation)
  vendorName: { type: String, default: '' },
  vendorTaxId: { type: String, default: '' },        // e.g. GST/HST # (if present)
  invoiceNumber: { type: String, default: '' },      // vendor invoice #
  externalId: { type: String, default: '' },         // statement transaction id, etc.
  externalRef: { type: String, default: '' },        // statement file name, etc.
  source: { type: String, enum: ['manual', 'ocr_receipt', 'bank_import', 'csv_import', 'system'], default: 'manual' },
  reconciled: { type: Boolean, default: false },
  reconciledTo: { type: String, default: '' },       // e.g. "wave:txn_123"

  // Links
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' }, // optional job-linked
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },

  // Receipt metadata
  receiptUrl: { type: String, default: '' },
  receiptFilename: { type: String, default: '' },    // original name
  receiptMimeType: { type: String, default: '' },
  receiptSize: { type: Number, default: 0 },

  // Recurring
  recurring: RecurringSchema,

  // Audit
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },

  hidden: { type: Boolean, default: false },

}, { timestamps: true });

// Keep old field consistent + protect total
ExpenseSchema.pre('validate', function (next) {
  // Back-compat: if amountTotal missing but amount present
  if (!Number.isFinite(this.amountTotal) || this.amountTotal === 0) {
    const legacy = Number(this.amount) || 0;
    if (legacy) this.amountTotal = legacy;
  }
  // Back-compat: keep amount aligned to amountTotal
  this.amount = Number(this.amountTotal || this.amount || 0);

  // Back-compat: if incurredAt missing but date present
  if (!this.incurredAt && this.date) this.incurredAt = this.date;

  next();
});

// Useful indexes for queries
ExpenseSchema.index({ incurredAt: -1 });
ExpenseSchema.index({ paidAt: -1 });
ExpenseSchema.index({ craLine: 1, incurredAt: -1 });

const Expenses = model('Expenses', ExpenseSchema);
module.exports = Expenses;
