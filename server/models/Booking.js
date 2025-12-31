const { Schema, model, Types } = require('mongoose');

const ServiceLineSchema = new Schema(
  {
    serviceType: { type: String, default: '' },
    description: { type: String, default: '' },
    billingType: {
      type: String,
      enum: ['hours', 'quantity'],
      default: 'quantity',
    },
    hours: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const BookingSchema = new Schema({
  customerEmail: { type: String },
  customerName: { type: String },

  // Summary
  serviceType: { type: String },

  customerId: {
    type: Types.ObjectId,
    ref: 'Customer',
  },

  date: Date,

  services: {
    type: [ServiceLineSchema],
    default: [],
  },

  income: {
    type: Number,
    default: 0,
  },

  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },

  paidAt: { type: Date },

  // 🔁 UPDATED: remove 'invoiced' from status
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'in progress',
      'completed',
      'cancelled',
      'paid',
      'done',
    ],
    default: 'pending',
  },

  // ✅ NEW: invoiced flag
  invoiced: {
    type: Boolean,
    default: false,
  },

  hidden: {
    type: Boolean,
    default: false,
  },

  scheduleConfirmation: {
    type: Boolean,
    default: false,
  },
  disableConfirmation: {
    type: Boolean,
    default: false,
  },
  reminderScheduled: {
    type: Boolean,
    default: false,
  },
  confirmationDate: {
    type: Date,
    default: null,
  },
  reminderDate: {
    type: Date,
    default: null,
  },
  scheduledConfirmationDate: {
    type: Date,
    default: null,
  },
  scheduledReminderDate: {
    type: Date,
    default: null,
  },
  confirmationSent: {
    type: Boolean,
    default: false,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: '',
  },

  createdBy: {
    type: Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Types.ObjectId,
    ref: 'User',
  },

  customerSuggestedBookingDate: {
    type: Date,
    default: null,
  },
  customerSuggestedServiceType: {
    type: String,
    default: '',
  },
  customerSuggestedBookingComment: {
    type: String,
    default: '',
  },
  customerSuggestedBookingAcknowledged: {
    type: Boolean,
    default: false,
  },

  // --- Key timestamps for workflow automation ---
  confirmedAt: { type: Date },
  completedAt: { type: Date },
  // invoicedAt: { type: Date }, // still good: when invoice created/sent
  invoiceCreatedAt: { type: Date, default: null },   // when invoice record was generated
invoiceSentAt: { type: Date, default: null },      // when invoice was emailed / delivered

  // --- Workflow checklist flags ---
  workflow: {
    confirmedWithClient: { type: Boolean, default: false },
    serviceCompleted: { type: Boolean, default: false },
    invoiceSent: { type: Boolean, default: false },
    paymentReceived: { type: Boolean, default: false },
  },

  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

BookingSchema.index({ date: 1, status: 1, hidden: 1 });
BookingSchema.index({ completedAt: 1 });
BookingSchema.index({ paidAt: 1 });
BookingSchema.index({ customerId: 1 });
BookingSchema.index({ customerEmail: 1 });


const Booking = model('Booking', BookingSchema);

module.exports = Booking;
