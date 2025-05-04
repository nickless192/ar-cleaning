const { Schema, model } = require('mongoose');

const VisitorLogSchema = new Schema({
  visitDate: {
    type: Date,
    default: Date.now
  },

  visitorId: {
    type: String, // hashed IP + UA, or session ID
    required: true
  },

  sessionId: {
    type: String, // Unique session tracking (UUID, cookie, etc.)
  },

  page: {
    type: String, // The first page visited in this session
    required: true
  },

  pathsVisited: {
    type: [String], // Array of pages visited within the session
    default: [],
    validate: {
      validator: arr => arr.length <= 50, // optional limit
      message: 'Too many paths visited'
    }
  },

  referrer: {
    type: String, // "https://google.com", "https://instagram.com"
    default: null
  },

  userAgent: {
    type: String,
    required: true
  },

  deviceType: {
    type: String, // "desktop", "mobile", "tablet"
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

  geo: {
    ip: { type: String }, // optionally hashed
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

  utm: {
    source: String,
    medium: String,
    campaign: String
  }
}, {
  timestamps: true // adds createdAt, updatedAt
});

const VisitorLog = model('VisitorLog', VisitorLogSchema);
module.exports = VisitorLog;
