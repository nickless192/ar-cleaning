const { Schema, model, Types } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const ServiceSchema = new Schema({
  serviceType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  billingType: {
    type: String,
    enum: ["hours", "quantity"],
    default: "hours",
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: { type: Number, min: 0 },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false }); // _id is optional since these are embedded documents


const PaymentSchema = new Schema({
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit card', 'bank transfer', 'check', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
}, { _id: false });

const InvoiceSchema = new Schema({
  invoiceId: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId
  },
  invoiceNumber: {
    type: Number,
    unique: true,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String
  },
  services: [ServiceSchema], // <-- NEW array of services
  payment: [PaymentSchema], // <-- NEW array of payments
  totalCost: {
    type: Number
  },
  bookingId: { // <-- link to booking
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  notes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sentAt: { type: Date, default: null },
  sentTo: { type: String, default: "" },
}, {
  toJSON: {
    getters: true
  },
  id: false
});

const Invoice = model('Invoice', InvoiceSchema);

module.exports = Invoice;
