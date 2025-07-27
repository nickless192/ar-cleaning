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
    tax: { type: Number, default: 0 },           // optional
discount: { type: Number, default: 0 },      // optional
paidAt: { type: Date },                      // when money was *actually* received
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
    scheduledConfirmationDate: { 
        type: Date, 
        default: null 
    }, // date when confirmation is scheduled to be sent
    scheduledReminderDate: { 
        type: Date, 
        default: null 
    }, // date when reminder is scheduled to be sent
    confirmationSent: { 
        type: Boolean, 
        default: false 
    }, // whether confirmation email was sent
    reminderSent: { 
        type: Boolean, 
        default: false 
    }, // whether reminder email was sent
    notes: { 
        type: String, 
        default: '' 
    }, // additional notes for the booking
    createdBy: {
        type: Types.ObjectId, 
        ref: 'User' // reference to the user who created the booking
    },
    updatedBy: {
        type: Types.ObjectId, 
        ref: 'User' // reference to the user who last updated the booking
    },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

const Booking = model('Booking', BookingSchema);

module.exports = Booking;