// models/VisitorIdentity.js
const { Schema, model } = require("mongoose");

const VisitorIdentitySchema = new Schema(
  {
    visitorId: { type: String, required: true, unique: true, index: true },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    firstSessionId: { type: String, default: null },
    lastSessionId: { type: String, default: null },
  },
  { timestamps: true }
);

const VisitorIdentity = model("VisitorIdentity", VisitorIdentitySchema);

module.exports = VisitorIdentity;