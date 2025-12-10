// models/UserNotificationSettings.js
const { Schema, model, Types } = require('mongoose');

const UserNotificationSettingsSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
    // customer or admin; can use user.role too
    preferences: {
      // by notification key or category
      bookingConfirmation: {
        email: { type: Boolean, default: true },
      },
      bookingReminder: {
        email: { type: Boolean, default: true },
        frequency: { type: String, enum: ['immediate', 'daily', 'weekly'], default: 'immediate' },
      },
      adminUpcomingBookings: {
        email: { type: Boolean, default: true },
        frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
      },
      marketing: {
        email: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

const UserNotificationSettings = model('UserNotificationSettings', UserNotificationSettingsSchema);

module.exports = UserNotificationSettings;