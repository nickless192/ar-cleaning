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

const InvoiceSchema = new Schema({
  invoiceId: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId
  },
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  services: [ServiceSchema], // <-- NEW array of services
  totalCost: {
    type: Number
  },
    bookingId: { // <-- link to booking
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: {
    getters: true
  },
  id: false
});

const Invoice = model('Invoice', InvoiceSchema);

module.exports = Invoice;
