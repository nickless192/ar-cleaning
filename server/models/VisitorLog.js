const { Schema, model } = require('mongoose');

const VisitorLogSchema = new Schema({
  visitDate: {
    type: Date,
    default: Date.now
  },

  visitorId: {
    type: String,
    required: true
  },

  sessionId: {
    type: String
  },

  page: {
    type: String,
    required: true
  },

  pathsVisited: {
    type: [String],
    default: [],
    validate: {
      validator: arr => arr.length <= 50,
      message: 'Too many paths visited'
    }
  },

  referrer: {
    type: String,
    default: null
  },

  userAgent: {
    type: String,
    required: true
  },

  deviceType: {
    type: String,
    default: 'unknown'
  },

  browser: {
    type: String,
    default: 'unknown'
  },

  os: {
    type: String,
    default: 'unknown'
  },

  ip: {
    type: String,
    default: null
  },

  geo: {
    country: { type: String },
    region: { type: String },
    city: { type: String },
    timezone: { type: String }
  },

  isReturningVisitor: {
    type: Boolean,
    default: false
  },

  firstSeenAt: {
    type: Date,
    default: Date.now
  },

  lastSeenAt: {
    type: Date,
    default: Date.now
  },

  // NEW 📐 System Info
  screenResolution: {
    type: String // e.g., "1920x1080"
  },
  language: {
    type: String // e.g., "en-US"
  },

  // NEW 🔁 Engagement Tracking
  scrollDepth: {
    type: Number, // 0–100%
    default: 0
  },
  interactions: {
    type: [String],
    default: []
  },
  sessionDuration: {
    type: Number, // seconds
    default: 0
  },
  engagementScore: {
    type: Number,
    default: 0
  },
  isBounce: {
    type: Boolean,
    default: false
  },

  // NEW 🎯 Marketing Attribution
  utm: {
    source: String,
    medium: String,
    campaign: String
  },

  trafficSource: {
    type: String, // "organic", "ads", "social", "direct", "referral"
    default: "unknown"
  },

  // NEW 🧠 Classification / Segments
  segment: {
    type: String // optional manual/automated tagging
  },
  interactions: {
    type: [String],
    default: [],
    validate: {
      validator: arr => arr.length <= 100, // optional limit
      message: 'Too many interaction events recorded'
    }
  },
  sessionDuration: { type: Number, default: 0 },       // ms
  scrollDepth: { type: Number, default: 0 },           // percentage
  isBot: { type: Boolean, default: false },

}, {
  timestamps: true
});

const VisitorLog = model('VisitorLog', VisitorLogSchema);
module.exports = VisitorLog;
