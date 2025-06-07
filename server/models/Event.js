const { Schema, model, Types } = require('mongoose');

const EventSchema = new Schema({
    action: { type: String, required: true }, // e.g. 'quote_clicked'
    variant: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    userAgent: { type: String },
    page: { type: String }, // optional: e.g., 'welcome_modal'
});

const Event = model('Event', EventSchema);

module.exports = Event;