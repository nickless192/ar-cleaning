const { Schema, model, Types } = require('mongoose');

const LocationSchema = new Schema(
  {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    accuracy: { type: Number, default: null },
  },
  { _id: false }
);

const EditHistorySchema = new Schema(
  {
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true },
    changes: {
      type: [
        {
          field: { type: String, required: true },
          from: { type: Schema.Types.Mixed, default: null },
          to: { type: Schema.Types.Mixed, default: null },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const AppointmentTimeEntrySchema = new Schema(
  {
    bookingId: { type: Types.ObjectId, ref: 'Booking', required: true, index: true },
    employeeId: { type: Types.ObjectId, ref: 'User', required: true, index: true },

    checkInAt: { type: Date, default: null },
    checkOutAt: { type: Date, default: null },
    originalCheckInAt: { type: Date, default: null },
    originalCheckOutAt: { type: Date, default: null },

    checkInLocation: { type: LocationSchema, default: null },
    checkOutLocation: { type: LocationSchema, default: null },

    checkInSource: {
      type: String,
      enum: ['web', 'mobile', 'manual', 'admin'],
      default: 'web',
    },
    checkOutSource: {
      type: String,
      enum: ['web', 'mobile', 'manual', 'admin'],
      default: 'web',
    },

    checkInDevice: {
      userAgent: { type: String, default: '' },
      platform: { type: String, default: '' },
    },
    checkOutDevice: {
      userAgent: { type: String, default: '' },
      platform: { type: String, default: '' },
    },

    totalMinutes: { type: Number, default: 0 },
    needsReview: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['checked_in', 'checked_out', 'adjusted', 'disputed', 'approved'],
      default: 'checked_in',
      index: true,
    },

    employeeNotes: {
      workCompleted: { type: String, default: '' },
      issuesFound: { type: String, default: '' },
      suppliesNeeded: { type: String, default: '' },
      accessIssue: { type: String, default: '' },
      extraTimeRequired: { type: String, default: '' },
      general: { type: String, default: '' },
    },
    adminNotes: { type: String, default: '' },

    attachments: {
      type: [
        {
          type: { type: String, default: 'photo' },
          url: { type: String, default: '' },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    editedBy: { type: Types.ObjectId, ref: 'User', default: null },
    editHistory: { type: [EditHistorySchema], default: [] },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
  }
);

AppointmentTimeEntrySchema.index({ bookingId: 1, employeeId: 1, createdAt: -1 });
AppointmentTimeEntrySchema.index({ employeeId: 1, checkInAt: -1 });

module.exports = model('AppointmentTimeEntry', AppointmentTimeEntrySchema);
