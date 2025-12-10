// models/NotificationTemplate.js
const { Schema, model } = require('mongoose');

const NotificationTemplateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true }, // e.g. 'booking_confirmation_customer'
    name: String,
    type: { type: String, enum: ['transactional', 'marketing'], required: true },
    subject: { type: String, required: true },
    html: { type: String, required: true }, // can include placeholders like {{customerName}}
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const NotificationTemplate = model('NotificationTemplate', NotificationTemplateSchema);

module.exports = NotificationTemplate;