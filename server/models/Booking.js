const { Schema, model, Types } = require('mongoose');

const BookingSchema = new Schema({
    customerEmail: {
        type: String,
    },
    customerName: {
        type: String,
    },
    serviceType: {
        type: String,
    },
    customerId: {
        type: Types.ObjectId,
        ref: 'Customer'
    },
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
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'paid', 'in progress'],
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
    customerSuggestedBookingDate: {
        type: Date,
        default: null
    }, // date when the customer suggested booking was created
    customerSuggestedServiceType: {
        type: String,
        default: ''
    }, // service type suggested by the customer
    customerSuggestedBookingComment: {
        type: String,
        default: ''
    }, // comment from the customer about the suggested booking
    // add acknowledgment field
    customerSuggestedBookingAcknowledged: {
        type: Boolean,
        default: false
    },
    // --- Key timestamps for workflow automation ---
    confirmedAt: { type: Date }, // when booking was confirmed
    completedAt: { type: Date }, // when service marked as completed
    invoicedAt: { type: Date },  // when invoice was sent
    paidAt: { type: Date },      // when payment confirmed

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

const Booking = model('Booking', BookingSchema);

module.exports = Booking;