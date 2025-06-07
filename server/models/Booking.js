const { Schema, model, Types } = require('mongoose');

const BookingSchema = new Schema({
    customerEmail: String,
    customerName: String,
    serviceType: String,
    date: Date, // actual service date
    scheduleConfirmation: {
        type: Boolean, 
        default: false
    },
    reminderScheduled: { 
        type: Boolean, 
        default: false 
    },
    confirmationDate: { 
        type: Date, 
        default: null 
    }, // date when confirmation was sent    
    createdAt: { type: Date, default: Date.now },
});

const Booking = model('Booking', BookingSchema);

module.exports = Booking;