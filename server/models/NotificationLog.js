// models/NotificationLog.js
const { Schema, model, Types } = require('mongoose');

const NotificationLogSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User' },
    type: { type: String, required: true }, // 'booking_confirmation_customer'
    channel: { type: String, enum: ['email', 'sms', 'in_app'], required: true },
    to: String,
    status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
    providerId: String, // SendGrid message ID
    error: String,
    payload: Schema.Types.Mixed, // optional: context data
  },
  { timestamps: true }
);

const NotificationLog = model('NotificationLog', NotificationLogSchema);

module.exports = NotificationLog;
    