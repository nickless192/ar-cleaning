const { Schema, model, Types } = require('mongoose');

const BookingSchema = new Schema({
    customerEmail: String,
    customerName: String,
    serviceType: String,
    date: Date, // actual service date
    income: {
        type: Number,
        default: 0
    }, // income from this booking
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    }, // booking status
    hidden: {
        type: Boolean, 
        default: false
    },
    scheduleConfirmation: {
        type: Boolean, 
        default: false
    },
    disableConfirmation: { 
        type: Boolean, 
        default: false 
    }, // whether to disable confirmation email
    reminderScheduled: { 
        type: Boolean, 
        default: false 
    },
    confirmationDate: { 
        type: Date, 
        default: null 
    }, // date when confirmation was sent   
    reminderDate: { 
        type: Date, 
        default: null 
    }, // date when reminder was sent 
    confirmationSent: { 
        type: Boolean, 
        default: false 
    }, // whether confirmation email was sent
    reminderSent: { 
        type: Boolean, 
        default: false 
    }, // whether reminder email was sent
    createdAt: { type: Date, default: Date.now },
});

const Booking = model('Booking', BookingSchema);

module.exports = Booking;