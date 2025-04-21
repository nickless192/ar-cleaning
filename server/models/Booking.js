const { Schema, model, Types } = require('mongoose');

const BookingSchema = new Schema({
    customerEmail: String,
    customerName: String,
    serviceType: String,
    date: Date, // actual service date
    confirmationSent: { type: Boolean, default: false },
    reminderScheduled: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const Booking = model('Booking', BookingSchema);

module.exports = Booking;