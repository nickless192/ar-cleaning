// models/CompanyNotificationDefaults.js
const { Schema, model } = require('mongoose');

const CompanyNotificationDefaultsSchema = new Schema(
  {
    companyName: String, // CleanAR Solutions
    bookingReminderCustomer: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'immediate' },
      hoursBefore: { type: Number, default: 24 },
    },
    upcomingBookingsAdmin: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
      timeOfDay: { type: String, default: '07:00' }, // could be used for cron config
    },
    marketing: {
      enabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const CompanyNotificationDefaults = model('CompanyNotificationDefaults', CompanyNotificationDefaultsSchema);

module.exports = CompanyNotificationDefaults;